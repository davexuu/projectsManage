import { AccessRole } from "@prisma/client";
import express, { Router } from "express";
import { z } from "zod";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { deleteObjectFromMinio, getObjectFromMinio, uploadObjectToMinio } from "../../services/minio.js";
import { createProjectSchema } from "../../services/validators.js";
import { ah, parse, projectIdFromParams } from "../shared/http.js";
import { allowedProjectIds } from "../shared/projectAccess.js";

const projectMemberSchema = z.object({
  userId: z.string().min(1),
  accessRole: z.nativeEnum(AccessRole)
});

const attachmentCategoryValues = ["prototype", "prd", "kickoff", "other"] as const;
const attachmentUploadQuerySchema = z.object({
  category: z.enum(attachmentCategoryValues),
  fileName: z.string().min(1).max(200)
});

export const projectsRouter = Router();

projectsRouter.get(
  "/projects",
  ah(async (req, res) => {
    res.json(await store.listProjects(await allowedProjectIds(req)));
  })
);

projectsRouter.post(
  "/projects",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const input = parse(createProjectSchema, req.body);
    if (await store.hasProjectName(input.projectName)) {
      res.status(409).json({ message: "项目名称已存在，请保持唯一" });
      return;
    }
    res.status(201).json(await store.createProject(input, req.auth?.userId));
  })
);

projectsRouter.put(
  "/projects/:id",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const input = parse(createProjectSchema, req.body);
    if (await store.hasProjectName(input.projectName, req.params.id)) {
      res.status(409).json({ message: "项目名称已存在，请保持唯一" });
      return;
    }
    res.json(await store.updateProject(req.params.id, input));
  })
);

projectsRouter.delete(
  "/projects/:id",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    await store.deleteProject(req.params.id);
    res.json({ ok: true });
  })
);

projectsRouter.get(
  "/projects/:projectId/dashboard",
  requireProjectAccess(projectIdFromParams),
  ah(async (req, res) => {
    const data = await store.getProjectDashboard(req.params.projectId);
    if (!data) {
      res.status(404).json({ message: "项目不存在" });
      return;
    }
    res.json(data);
  })
);

projectsRouter.get(
  "/projects/:projectId/members",
  requireProjectAccess(projectIdFromParams),
  ah(async (req, res) => {
    res.json(await store.listProjectMembers(req.params.projectId));
  })
);

projectsRouter.post(
  "/projects/:projectId/members",
  requireProjectAccess(projectIdFromParams, [AccessRole.OWNER]),
  ah(async (req, res) => {
    const input = parse(projectMemberSchema, req.body);
    const userExists = await store.hasEnabledSysUser(input.userId);
    if (!userExists) {
      res.status(400).json({ message: "用户不存在" });
      return;
    }
    res.status(201).json(await store.upsertProjectMember(req.params.projectId, input.userId, input.accessRole));
  })
);

projectsRouter.delete(
  "/projects/:projectId/members/:userId",
  requireProjectAccess(projectIdFromParams, [AccessRole.OWNER]),
  ah(async (req, res) => {
    await store.removeProjectMember(req.params.projectId, req.params.userId);
    res.json({ ok: true });
  })
);

projectsRouter.get(
  "/projects/:projectId/attachments",
  requireProjectAccess(projectIdFromParams),
  ah(async (req, res) => {
    res.json(await store.listProjectAttachments(req.params.projectId));
  })
);

projectsRouter.post(
  "/projects/:projectId/attachments/upload",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromParams, [AccessRole.OWNER, AccessRole.EDITOR]),
  express.raw({ type: "*/*", limit: "20mb" }),
  ah(async (req, res) => {
    const query = parse(attachmentUploadQuerySchema, req.query);
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (body.length === 0) {
      res.status(400).json({ message: "上传内容不能为空" });
      return;
    }
    if (body.length > 20 * 1024 * 1024) {
      res.status(400).json({ message: "附件大小不能超过 20MB" });
      return;
    }

    const projectId = req.params.projectId;
    const safeFileName = query.fileName.replace(/[\\r\\n]/g, "").replace(/[\\/]/g, "_").trim();
    if (!safeFileName) {
      res.status(400).json({ message: "文件名不合法" });
      return;
    }
    const now = Date.now();
    const objectKey = `projects/${projectId}/${query.category}/${now}-${safeFileName}`;
    const mimeType = String(req.headers["content-type"] ?? "application/octet-stream");

    await uploadObjectToMinio(objectKey, body, mimeType);
    const row = await store.createProjectAttachment({
      projectId,
      category: query.category,
      fileName: safeFileName,
      objectKey,
      mimeType,
      fileSize: BigInt(body.length),
      uploaderId: req.auth?.userId
    });
    res.status(201).json(row);
  })
);

projectsRouter.get(
  "/projects/:projectId/attachments/:attachmentId/download",
  requireProjectAccess(projectIdFromParams),
  ah(async (req, res) => {
    const row = await store.getProjectAttachment(req.params.projectId, req.params.attachmentId);
    if (!row) {
      res.status(404).json({ message: "附件不存在" });
      return;
    }
    const data = await getObjectFromMinio(row.objectKey);
    const encodedName = encodeURIComponent(row.fileName);
    res.setHeader("Content-Type", data.contentType || row.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodedName}`);
    res.send(data.body);
  })
);

projectsRouter.delete(
  "/projects/:projectId/attachments/:attachmentId",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromParams, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const row = await store.deleteProjectAttachment(req.params.projectId, req.params.attachmentId);
    if (!row) {
      res.status(404).json({ message: "附件不存在" });
      return;
    }
    await deleteObjectFromMinio(row.objectKey);
    res.json({ ok: true });
  })
);
