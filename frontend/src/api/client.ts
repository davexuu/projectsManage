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

export interface UserManageItem {
  id: string;
  username: string;
  displayName: string;
  officeId?: string;
  officeName: string;
  mobile: string;
  email: string;
  status: "ENABLED" | "DISABLED";
  roleCode: "ADMIN" | "PM" | "MEMBER";
  roleName: string;
  createdAt: string;
}

export interface ProjectReportItem {
  id: string;
  projectId: string;
  reportType: "WEEKLY" | "MONTHLY";
  period: string;
  status: "DRAFT" | "SUBMITTED";
  content: string;
  sourceSnapshot?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAttachmentItem {
  id: string;
  projectId: string;
  category: "prototype" | "prd" | "kickoff" | "other";
  fileName: string;
  objectKey: string;
  mimeType?: string;
  fileSize: string;
  uploaderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickWbsSuggestionResult {
  intent: "新增" | "修复" | "优化" | "合规";
  mode: "light" | "standard" | "complete";
  targetStage: "启动" | "规划" | "执行" | "验收";
  normalizedPrompt: string;
  reason: string;
  items: Array<Record<string, unknown>>;
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
  userRoles: () =>
    request<Array<{ id: string; roleCode: "ADMIN" | "PM" | "MEMBER"; roleName: string }>>("/users/roles"),
  listUserManage: (query?: {
    officeId?: string;
    username?: string;
    mobile?: string;
    status?: "ENABLED" | "DISABLED";
    createdFrom?: string;
    createdTo?: string;
  }) => {
    const q = new URLSearchParams();
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v) q.set(k, String(v));
    });
    const suffix = q.toString();
    return request<UserManageItem[]>(`/users/manage${suffix ? `?${suffix}` : ""}`);
  },
  createUserManage: (payload: {
    username: string;
    displayName: string;
    password?: string;
    officeId?: string;
    mobile?: string;
    email?: string;
    status?: "ENABLED" | "DISABLED";
    roleCode: "ADMIN" | "PM" | "MEMBER";
  }) =>
    request<{ id: string }>("/users/manage", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUserManage: (
    id: string,
    payload: {
      username: string;
      displayName: string;
      password?: string;
      officeId?: string;
      mobile?: string;
      email?: string;
      status?: "ENABLED" | "DISABLED";
      roleCode: "ADMIN" | "PM" | "MEMBER";
    }
  ) =>
    request<{ ok: true }>(`/users/manage/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  updateUserStatus: (id: string, status: "ENABLED" | "DISABLED") =>
    request<{ ok: true }>(`/users/manage/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  deleteUserManage: (id: string) =>
    request<{ ok: true }>(`/users/manage/${id}`, {
      method: "DELETE"
    }),
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
  projectReportSummary: (projectId: string) =>
    request<{ weekly: ProjectReportItem | null; monthly: ProjectReportItem | null }>(`/project-reports/summary?projectId=${projectId}`),
  listProjectReports: (projectId: string, reportType?: "WEEKLY" | "MONTHLY") =>
    request<ProjectReportItem[]>(`/project-reports?projectId=${projectId}${reportType ? `&reportType=${reportType}` : ""}`),
  upsertProjectReport: (payload: {
    projectId: string;
    reportType: "WEEKLY" | "MONTHLY";
    period: string;
    status: "DRAFT" | "SUBMITTED";
    content: string;
    sourceSnapshot?: unknown;
  }) =>
    request<ProjectReportItem>("/project-reports/upsert", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  generateProjectReportDraft: (payload: { projectId: string; reportType: "WEEKLY" | "MONTHLY"; period: string }) =>
    request<ProjectReportItem>("/project-reports/generate-draft", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateWbsStatus: (id: string, payload: { projectId: string; currentStatus: "未开始" | "进行中" | "延期" | "已完成" }) =>
    request<unknown>(`/wbs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  batchCreateWbs: (payload: { projectId: string; items: Array<Record<string, unknown>> }) =>
    request<{ createdCount: number; items: Array<Record<string, unknown>> }>("/wbs/batch", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  validateWbsPlan: (payload: { projectId: string; items: Array<Record<string, unknown>> }) =>
    request<{ ok: boolean; conflicts: Array<{ rowIndex: number; field: string; message: string; relatedTaskId?: string }> }>(
      "/wbs/validate-plan",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),
  quickSuggestWbs: (payload: {
    projectId: string;
    prompt: string;
    mode?: "light" | "standard" | "complete";
    targetStage?: "启动" | "规划" | "执行" | "验收";
  }) =>
    request<QuickWbsSuggestionResult>("/wbs/quick-suggestions", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
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
  listProjectAttachments: (projectId: string) =>
    request<ProjectAttachmentItem[]>(`/projects/${projectId}/attachments`),
  uploadProjectAttachment: async (
    projectId: string,
    category: "prototype" | "prd" | "kickoff" | "other",
    file: File
  ) => {
    const token = getToken();
    const query = new URLSearchParams({
      category,
      fileName: file.name
    });
    const res = await fetch(`${API_BASE}/projects/${projectId}/attachments/upload?${query.toString()}`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || `上传失败: ${res.status}`, res.status);
    }
    return (await res.json()) as ProjectAttachmentItem;
  },
  downloadProjectAttachment: async (projectId: string, attachmentId: string) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/projects/${projectId}/attachments/${attachmentId}/download`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || `下载失败: ${res.status}`, res.status);
    }
    const contentDisposition = res.headers.get("Content-Disposition") || "";
    const fileNameMatch = contentDisposition.match(/filename\\*=UTF-8''(.+)$/);
    const fileName = fileNameMatch?.[1] ? decodeURIComponent(fileNameMatch[1]) : "附件";
    const blob = await res.blob();
    return { blob, fileName };
  },
  deleteProjectAttachment: (projectId: string, attachmentId: string) =>
    request<{ ok: true }>(`/projects/${projectId}/attachments/${attachmentId}`, {
      method: "DELETE"
    }),
  list: (endpoint: string, projectId?: string, extraQuery?: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    if (projectId) query.set("projectId", projectId);
    Object.entries(extraQuery || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, value);
    });
    const suffix = query.toString();
    return request<unknown[]>(`/${endpoint}${suffix ? `?${suffix}` : ""}`);
  },
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
