import { ApiError } from "../api/client";

export interface ParsedFormError {
  message: string;
  fieldErrors: Record<string, string>;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "操作失败，请稍后重试";
}

export function parseFormError(error: unknown): ParsedFormError {
  const message = getErrorMessage(error);
  const fieldErrors: Record<string, string> = {};

  if (error instanceof ApiError) {
    const details = error.details as Record<string, unknown> | undefined;
    const issues = details?.errors;
    if (Array.isArray(issues)) {
      issues.forEach((item) => {
        if (!item || typeof item !== "object") return;
        const issue = item as Record<string, unknown>;
        const path = issue.path;
        const msg = issue.message;
        if (!Array.isArray(path) || typeof msg !== "string") return;
        const first = path[0];
        if (typeof first !== "string" || !first.trim()) return;
        fieldErrors[first] = msg;
      });
    }
  }

  return { message, fieldErrors };
}

