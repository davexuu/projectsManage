import crypto from "crypto";
import jwt from "jsonwebtoken";
import { SysStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./store.js";

export type UserRole = "ADMIN" | "PM" | "MEMBER";

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  passwordHash: string;
}

export interface AuthPayload {
  userId: string;
  username: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET || "pmp-dev-secret";
const JWT_EXPIRES_IN = "12h";

function toAppRole(roleCodes: string[]): UserRole {
  if (roleCodes.includes("ADMIN")) return "ADMIN";
  if (roleCodes.includes("PM")) return "PM";
  return "MEMBER";
}

function mapSysUser(
  user: {
    id: string;
    username: string;
    displayName: string;
    passwordHash: string;
    roles: Array<{ role: { roleCode: string } }>;
  }
): User {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    passwordHash: user.passwordHash,
    role: toAppRole(user.roles.map((item) => item.role.roleCode))
  };
}

export async function listUsersBasic() {
  const users = await prisma.sysUser.findMany({
    where: { status: SysStatus.ENABLED },
    include: { roles: { include: { role: { select: { roleCode: true } } } } },
    orderBy: { createdAt: "asc" }
  });
  return users.map((u) => {
    const mapped = mapSysUser(u);
    return {
      id: mapped.id,
      username: mapped.username,
      displayName: mapped.displayName,
      role: mapped.role
    };
  });
}

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6)
});

export function hashPassword(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const user = await prisma.sysUser.findFirst({
    where: { username, status: SysStatus.ENABLED },
    include: { roles: { include: { role: { select: { roleCode: true } } } } }
  });
  if (!user) {
    return null;
  }
  const mapped = mapSysUser(user);
  return hashPassword(password) === mapped.passwordHash ? mapped : null;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export async function findUserById(userId: string): Promise<User | null> {
  const user = await prisma.sysUser.findFirst({
    where: { id: userId, status: SysStatus.ENABLED },
    include: { roles: { include: { role: { select: { roleCode: true } } } } }
  });
  return user ? mapSysUser(user) : null;
}
