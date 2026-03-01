import { SysStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../../middleware/auth.js";
import { hashPassword, listUsersBasic } from "../../services/auth.js";
import { prisma } from "../../services/store.js";
import { ah, parse } from "../shared/http.js";

export const usersRouter = Router();

const listQuerySchema = z.object({
  officeId: z.string().optional(),
  username: z.string().optional(),
  mobile: z.string().optional(),
  status: z.nativeEnum(SysStatus).optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional()
});

const userUpsertSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().min(1),
  password: z.string().min(6).optional(),
  officeId: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.nativeEnum(SysStatus).optional(),
  roleCode: z.enum(["ADMIN", "PM", "MEMBER"]).default("MEMBER")
});

const statusUpdateSchema = z.object({
  status: z.nativeEnum(SysStatus)
});

usersRouter.get(
  "/users",
  requireRole(["ADMIN", "PM"]),
  ah(async (_req, res) => {
    res.json(await listUsersBasic());
  })
);

usersRouter.get(
  "/users/roles",
  requireRole(["ADMIN", "PM"]),
  ah(async (_req, res) => {
    const rows = await prisma.sysRole.findMany({
      where: { roleCode: { in: ["ADMIN", "PM", "MEMBER"] } },
      select: { id: true, roleCode: true, roleName: true },
      orderBy: { sort: "asc" }
    });
    res.json(rows);
  })
);

usersRouter.get(
  "/users/manage",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const query = parse(listQuerySchema, req.query);
    const createdFrom = query.createdFrom ? new Date(query.createdFrom) : undefined;
    const createdTo = query.createdTo ? new Date(query.createdTo) : undefined;

    const users = await prisma.sysUser.findMany({
      where: {
        ...(query.officeId ? { officeId: query.officeId } : {}),
        ...(query.username ? { username: { contains: query.username } } : {}),
        ...(query.mobile ? { mobile: { contains: query.mobile } } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(createdFrom || createdTo
          ? {
              createdAt: {
                ...(createdFrom ? { gte: createdFrom } : {}),
                ...(createdTo ? { lte: createdTo } : {})
              }
            }
          : {})
      },
      include: {
        office: { select: { id: true, officeName: true } },
        roles: { include: { role: { select: { roleCode: true, roleName: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(
      users.map((u) => {
        const roleCodes = u.roles.map((r) => r.role.roleCode);
        const roleNames = u.roles.map((r) => r.role.roleName);
        return {
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          officeId: u.officeId,
          officeName: u.office?.officeName ?? "",
          mobile: u.mobile ?? "",
          email: u.email ?? "",
          status: u.status,
          roleCode: roleCodes.includes("ADMIN") ? "ADMIN" : roleCodes.includes("PM") ? "PM" : "MEMBER",
          roleName: roleNames[0] ?? "项目成员",
          createdAt: u.createdAt
        };
      })
    );
  })
);

usersRouter.post(
  "/users/manage",
  requireRole(["ADMIN"]),
  ah(async (req, res) => {
    const input = parse(userUpsertSchema, req.body);

    const existed = await prisma.sysUser.findUnique({ where: { username: input.username } });
    if (existed) {
      res.status(409).json({ message: "账号已存在" });
      return;
    }

    const role = await prisma.sysRole.findUnique({ where: { roleCode: input.roleCode } });
    if (!role) {
      res.status(400).json({ message: "角色不存在" });
      return;
    }

    const created = await prisma.sysUser.create({
      data: {
        username: input.username.trim(),
        displayName: input.displayName.trim(),
        passwordHash: hashPassword(input.password || "123456"),
        officeId: input.officeId || null,
        mobile: input.mobile || null,
        email: input.email || null,
        status: input.status ?? SysStatus.ENABLED
      }
    });

    await prisma.sysUserRole.create({
      data: { userId: created.id, roleId: role.id }
    });

    res.status(201).json({ id: created.id });
  })
);

usersRouter.put(
  "/users/manage/:id",
  requireRole(["ADMIN"]),
  ah(async (req, res) => {
    const input = parse(userUpsertSchema, req.body);
    const userId = req.params.id;

    const existed = await prisma.sysUser.findFirst({
      where: { username: input.username, NOT: { id: userId } },
      select: { id: true }
    });
    if (existed) {
      res.status(409).json({ message: "账号已存在" });
      return;
    }

    const role = await prisma.sysRole.findUnique({ where: { roleCode: input.roleCode } });
    if (!role) {
      res.status(400).json({ message: "角色不存在" });
      return;
    }

    await prisma.sysUser.update({
      where: { id: userId },
      data: {
        username: input.username.trim(),
        displayName: input.displayName.trim(),
        ...(input.password ? { passwordHash: hashPassword(input.password) } : {}),
        officeId: input.officeId || null,
        mobile: input.mobile || null,
        email: input.email || null,
        status: input.status ?? SysStatus.ENABLED
      }
    });

    await prisma.sysUserRole.deleteMany({ where: { userId } });
    await prisma.sysUserRole.create({ data: { userId, roleId: role.id } });
    res.json({ ok: true });
  })
);

usersRouter.patch(
  "/users/manage/:id/status",
  requireRole(["ADMIN"]),
  ah(async (req, res) => {
    const { status } = parse(statusUpdateSchema, req.body);
    await prisma.sysUser.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ ok: true });
  })
);

usersRouter.delete(
  "/users/manage/:id",
  requireRole(["ADMIN"]),
  ah(async (req, res) => {
    if (req.auth?.userId === req.params.id) {
      res.status(400).json({ message: "不能删除当前登录用户" });
      return;
    }
    await prisma.sysUser.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);
