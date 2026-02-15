import { AccessRole } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import { requireAuth, requireProjectAccess, requireRole } from "../middleware/auth.js";
import { formSchemas } from "../meta/formSchemas.js";
import { listUsersBasic } from "../services/auth.js";
import { store } from "../services/store.js";
import {
  createChangeSchema,
  createMilestoneSchema,
  createProgressRecordSchema,
  createProjectSchema,
  createRiskSchema,
  createStatusAssessmentSchema,
  createWbsSchema
} from "../services/validators.js";

const parse = <T>(schema: z.ZodSchema<T>, payload: unknown) => schema.parse(payload);
const projectIdFromQuery = (req: Request) => req.query.projectId as string | undefined;
const projectIdFromBody = (req: Request) => req.body?.projectId as string | undefined;
const projectIdFromParams = (req: Request) => req.params.projectId;

const projectMemberSchema = z.object({
  userId: z.string().min(1),
  accessRole: z.nativeEnum(AccessRole)
});

const ah =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

async function allowedProjectIds(req: Request) {
  if (req.auth?.role === "ADMIN") {
    return undefined;
  }
  return store.getAllowedProjectIds(req.auth!.userId);
}

async function ensureProjectReadable(req: Request, projectId?: string) {
  if (req.auth?.role === "ADMIN") return;
  if (!projectId) return;
  const ok = await store.hasProjectAccess(req.auth!.userId, projectId);
  return ok;
}

export const apiRouter = Router();

apiRouter.use(requireAuth);

apiRouter.get("/meta/forms", (_req, res) => {
  res.json(formSchemas);
});

apiRouter.get(
  "/users",
  requireRole(["ADMIN", "PM"]),
  ah(async (_req, res) => {
    res.json(await listUsersBasic());
  })
);

apiRouter.get(
  "/projects",
  ah(async (req, res) => {
    res.json(await store.listProjects(await allowedProjectIds(req)));
  })
);

apiRouter.post(
  "/projects",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const input = parse(createProjectSchema, req.body);
    res.status(201).json(await store.createProject(input, req.auth?.userId));
  })
);

apiRouter.get(
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

apiRouter.get(
  "/projects/:projectId/members",
  requireProjectAccess(projectIdFromParams),
  ah(async (req, res) => {
    res.json(await store.listProjectMembers(req.params.projectId));
  })
);

apiRouter.post(
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

apiRouter.delete(
  "/projects/:projectId/members/:userId",
  requireProjectAccess(projectIdFromParams, [AccessRole.OWNER]),
  ah(async (req, res) => {
    await store.removeProjectMember(req.params.projectId, req.params.userId);
    res.json({ ok: true });
  })
);

apiRouter.get(
  "/wbs",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if ((await ensureProjectReadable(req, projectId)) === false) {
      res.status(403).json({ message: "无该项目访问权限" });
      return;
    }
    res.json(await store.listWbs(projectId, await allowedProjectIds(req)));
  })
);

apiRouter.post(
  "/wbs",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createWbsSchema, req.body);
    res.status(201).json(await store.createWbs(input));
  })
);

apiRouter.get(
  "/milestones",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if ((await ensureProjectReadable(req, projectId)) === false) {
      res.status(403).json({ message: "无该项目访问权限" });
      return;
    }
    res.json(await store.listMilestones(projectId, await allowedProjectIds(req)));
  })
);

apiRouter.post(
  "/milestones",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createMilestoneSchema, req.body);
    res.status(201).json(await store.createMilestone(input));
  })
);

apiRouter.get(
  "/progress-records",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if ((await ensureProjectReadable(req, projectId)) === false) {
      res.status(403).json({ message: "无该项目访问权限" });
      return;
    }
    res.json(await store.listProgressRecords(projectId, await allowedProjectIds(req)));
  })
);

apiRouter.post(
  "/progress-records",
  requireRole(["ADMIN", "PM", "MEMBER"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createProgressRecordSchema, req.body);
    res.status(201).json(await store.createProgressRecord(input));
  })
);

apiRouter.get(
  "/status-assessments",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if ((await ensureProjectReadable(req, projectId)) === false) {
      res.status(403).json({ message: "无该项目访问权限" });
      return;
    }
    res.json(await store.listStatusAssessments(projectId, await allowedProjectIds(req)));
  })
);

apiRouter.post(
  "/status-assessments",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createStatusAssessmentSchema, req.body);
    res.status(201).json(await store.createStatusAssessment(input));
  })
);

apiRouter.get(
  "/risks",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if ((await ensureProjectReadable(req, projectId)) === false) {
      res.status(403).json({ message: "无该项目访问权限" });
      return;
    }
    res.json(await store.listRisks(projectId, await allowedProjectIds(req)));
  })
);

apiRouter.post(
  "/risks",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createRiskSchema, req.body);
    res.status(201).json(await store.createRisk(input));
  })
);

apiRouter.get(
  "/changes",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if ((await ensureProjectReadable(req, projectId)) === false) {
      res.status(403).json({ message: "无该项目访问权限" });
      return;
    }
    res.json(await store.listChanges(projectId, await allowedProjectIds(req)));
  })
);

apiRouter.post(
  "/changes",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createChangeSchema, req.body);
    res.status(201).json(await store.createChange(input));
  })
);
