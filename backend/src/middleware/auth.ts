import { NextFunction, Request, Response } from "express";
import { AccessRole } from "@prisma/client";
import { AuthPayload, UserRole, verifyToken } from "../services/auth.js";
import { store } from "../services/store.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未登录或令牌缺失" });
  }

  const token = header.slice(7);
  try {
    req.auth = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "令牌无效或已过期" });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ message: "未登录" });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "权限不足" });
    }
    return next();
  };
}

export function requireProjectAccess(projectIdResolver: (req: Request) => string | undefined, roles?: AccessRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ message: "未登录" });
    }
    if (req.auth.role === "ADMIN") {
      return next();
    }

    const projectId = projectIdResolver(req);
    if (!projectId) {
      return res.status(400).json({ message: "缺少 projectId" });
    }

    const ok = await store.hasProjectAccess(req.auth.userId, projectId, roles);
    if (!ok) {
      return res.status(403).json({ message: "无该项目访问权限" });
    }
    return next();
  };
}
