import crypto from 'node:crypto';

interface MinioConfig {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  region: string;
}

export interface MinioObjectResponse {
  body: Buffer;
  contentType?: string;
}

function sha256Hex(value: Buffer | string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key: Buffer | string, value: string) {
  return crypto.createHmac('sha256', key).update(value).digest();
}

function toAmzDate(date: Date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return {
    dateStamp: `${yyyy}${mm}${dd}`,
    amzDate: `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`
  };
}

function encodeObjectKey(objectKey: string) {
  return objectKey
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function loadConfig(): MinioConfig {
  const endpoint = String(process.env.MINIO_ENDPOINT ?? '').trim();
  const bucket = String(process.env.MINIO_BUCKET ?? '').trim();
  const accessKey = String(process.env.MINIO_ACCESS_KEY ?? '').trim();
  const secretKey = String(process.env.MINIO_SECRET_KEY ?? '').trim();
  const region = String(process.env.MINIO_REGION ?? 'us-east-1').trim();

  if (!endpoint || !bucket || !accessKey || !secretKey) {
    throw new Error('MinIO 未配置，请设置 MINIO_ENDPOINT/MINIO_BUCKET/MINIO_ACCESS_KEY/MINIO_SECRET_KEY');
  }

  return { endpoint, bucket, accessKey, secretKey, region };
}

function canonicalizeHeaders(headers: Record<string, string>) {
  const entries = Object.entries(headers)
    .map(([key, value]) => [key.toLowerCase(), value.trim()] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const canonicalHeaders = entries.map(([key, value]) => `${key}:${value}\n`).join('');
  const signedHeaders = entries.map(([key]) => key).join(';');
  return { canonicalHeaders, signedHeaders };
}

async function signedRequest(method: 'PUT' | 'GET' | 'DELETE', objectKey: string, payload: Buffer, extraHeaders?: Record<string, string>) {
  const config = loadConfig();
  const baseUrl = config.endpoint.startsWith('http://') || config.endpoint.startsWith('https://')
    ? config.endpoint
    : `http://${config.endpoint}`;
  const endpointUrl = new URL(baseUrl);
  const path = `/${config.bucket}/${encodeObjectKey(objectKey)}`;
  const now = new Date();
  const { dateStamp, amzDate } = toAmzDate(now);
  const payloadHash = sha256Hex(payload);

  const headers: Record<string, string> = {
    host: endpointUrl.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...(extraHeaders ?? {})
  };
  const { canonicalHeaders, signedHeaders } = canonicalizeHeaders(headers);

  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, sha256Hex(canonicalRequest)].join('\n');

  const kDate = hmac(`AWS4${config.secretKey}`, dateStamp);
  const kRegion = hmac(kDate, config.region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`${endpointUrl.origin}${path}`, {
    method,
    headers: {
      ...headers,
      Authorization: authorization
    },
    body: method === 'GET' ? undefined : new Uint8Array(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MinIO 请求失败(${res.status}): ${text || '未知错误'}`);
  }

  return res;
}

export async function uploadObjectToMinio(objectKey: string, content: Buffer, contentType: string) {
  await signedRequest('PUT', objectKey, content, {
    'content-type': contentType
  });
}

export async function getObjectFromMinio(objectKey: string): Promise<MinioObjectResponse> {
  const res = await signedRequest('GET', objectKey, Buffer.alloc(0));
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? undefined;
  return { body: buf, contentType };
}

export async function deleteObjectFromMinio(objectKey: string) {
  await signedRequest('DELETE', objectKey, Buffer.alloc(0));
}
