import { AccessRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { createProjectSchema } from "../../services/validators.js";
import { ah, parse, projectIdFromParams } from "../shared/http.js";
import { allowedProjectIds } from "../shared/projectAccess.js";

const projectMemberSchema = z.object({
  userId: z.string().min(1),
  accessRole: z.nativeEnum(AccessRole)
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
