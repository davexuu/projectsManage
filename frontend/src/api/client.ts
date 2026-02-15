import { FormSchemaMap } from "../types";

const API_BASE = "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export interface OrgNode {
  id: string;
  name: string;
  children: OrgNode[];
}

export interface DictItem {
  key: string;
  label: string;
  options: string[];
}

export interface SystemFieldMeta {
  key: string;
  label: string;
  kind: "string" | "number" | "boolean" | "date" | "json" | "enum";
  required: boolean;
  options?: string[];
}

export interface SystemEntityMeta {
  key: string;
  label: string;
  allowCreate: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
  fields: SystemFieldMeta[];
}

function getToken() {
  return localStorage.getItem("pmp_token") || "";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    let payload: unknown = undefined;
    let message = `请求失败: ${res.status}`;
    if (text) {
      try {
        payload = JSON.parse(text);
        if (payload && typeof payload === "object" && "message" in payload) {
          const candidate = (payload as Record<string, unknown>).message;
          if (typeof candidate === "string" && candidate.trim()) {
            message = candidate;
          }
        } else {
          message = text;
        }
      } catch {
        message = text;
      }
    }
    throw new ApiError(message, res.status, payload);
  }

  return res.json() as Promise<T>;
}

export const api = {
  login: (payload: { username: string; password: string }) =>
    request<{ token: string; user: { id: string; username: string; displayName: string; role: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),
  me: () => request<{ id: string; username: string; displayName: string; role: string }>("/auth/me"),
  users: () =>
    request<Array<{ id: string; username: string; displayName: string; role: string }>>("/users"),
  orgTree: () => request<OrgNode[]>("/system/org-tree"),
  createOrgNode: (payload: { name: string; parentId?: string }) =>
    request<{ id: string; name: string; parentId?: string | null }>("/system/org", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  renameOrgNode: (id: string, name: string) =>
    request<{ id: string; name: string }>(`/system/org/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name })
    }),
  deleteOrgNode: (id: string) =>
    request<{ ok: true; deleted: number }>(`/system/org/${id}`, {
      method: "DELETE"
    }),
  dictItems: () => request<DictItem[]>("/system/dicts"),
  addDictOption: (dictCode: string, value: string) =>
    request<{ ok: true }>(`/system/dicts/${dictCode}/options`, {
      method: "POST",
      body: JSON.stringify({ value })
    }),
  removeDictOption: (dictCode: string, value: string) =>
    request<{ ok: true }>(`/system/dicts/${dictCode}/options`, {
      method: "DELETE",
      body: JSON.stringify({ value })
    }),
  systemEntitiesMeta: () => request<SystemEntityMeta[]>("/system/entities"),
  listSystemEntityRows: (entity: string) => request<Array<Record<string, unknown>>>(`/system/entities/${entity}`),
  getSystemEntityRow: (entity: string, id: string) => request<Record<string, unknown>>(`/system/entities/${entity}/${id}`),
  createSystemEntityRow: (entity: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/system/entities/${entity}`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateSystemEntityRow: (entity: string, id: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/system/entities/${entity}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteSystemEntityRow: (entity: string, id: string) =>
    request<{ ok: true }>(`/system/entities/${entity}/${id}`, {
      method: "DELETE"
    }),
  getFormSchemas: () => request<FormSchemaMap>("/meta/forms"),
  dashboard: (projectId: string) => request<Record<string, unknown>>(`/projects/${projectId}/dashboard`),
  projectMembers: (projectId: string) =>
    request<Array<{ id: string; userId: string; accessRole: string }>>(`/projects/${projectId}/members`),
  upsertProjectMember: (projectId: string, payload: { userId: string; accessRole: "OWNER" | "EDITOR" | "VIEWER" }) =>
    request(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  removeProjectMember: (projectId: string, userId: string) =>
    request(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE"
    }),
  list: (endpoint: string, projectId?: string) =>
    request<unknown[]>(`/${endpoint}${projectId ? `?projectId=${projectId}` : ""}`),
  create: (endpoint: string, payload: Record<string, unknown>) =>
    request<unknown>(`/${endpoint}`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  update: (endpoint: string, id: string, payload: Record<string, unknown>) =>
    request<unknown>(`/${endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  delete: (endpoint: string, id: string, projectId?: string) =>
    request<unknown>(`/${endpoint}/${id}${projectId ? `?projectId=${projectId}` : ""}`, {
      method: "DELETE"
    }),
  previewImport: (filePath: string) =>
    request<{
      summary: Record<string, unknown>;
      data: Record<string, unknown[]>;
    }>("/import/preview", {
      method: "POST",
      body: JSON.stringify({ filePath })
    }),
  commitImport: (filePath: string) =>
    request<{
      projectId: string;
      created: Record<string, number>;
      skipped: Record<string, number>;
    }>("/import/commit", {
      method: "POST",
      body: JSON.stringify({ filePath })
    })
};
