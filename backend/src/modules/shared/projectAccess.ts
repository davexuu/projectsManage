import { Request, Response } from "express";
import { store } from "../../services/store.js";

export async function allowedProjectIds(req: Request) {
  if (req.auth?.role === "ADMIN") {
    return undefined;
  }
  return store.getAllowedProjectIds(req.auth!.userId);
}

export async function ensureReadableOr403(req: Request, res: Response, projectId?: string) {
  if (req.auth?.role === "ADMIN" || !projectId) {
    return true;
  }
  if (!req.auth) {
    res.status(401).json({ message: "未登录" });
    return false;
  }

  const ok = await store.hasProjectAccess(req.auth.userId, projectId);
  if (!ok) {
    res.status(403).json({ message: "无该项目访问权限" });
    return false;
  }
  return true;
}
