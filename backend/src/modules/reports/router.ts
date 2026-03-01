import { AccessRole } from "@prisma/client";
import { Router } from "express";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { generateProjectReportSchema, upsertProjectReportSchema } from "../../services/validators.js";
import { ah, parse, projectIdFromBody, projectIdFromQuery } from "../shared/http.js";
import { allowedProjectIds, ensureReadableOr403 } from "../shared/projectAccess.js";

export const reportsRouter = Router();

reportsRouter.get(
  "/project-reports",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if (!(await ensureReadableOr403(req, res, projectId))) return;
    const reportType = (req.query.reportType as "WEEKLY" | "MONTHLY" | undefined) || undefined;
    res.json(await store.listProjectReports(projectId, await allowedProjectIds(req), reportType));
  })
);

reportsRouter.get(
  "/project-reports/summary",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if (!(await ensureReadableOr403(req, res, projectId))) return;
    if (!projectId) {
      res.status(400).json({ message: "缺少 projectId" });
      return;
    }
    res.json(await store.getProjectReportSummary(projectId));
  })
);

reportsRouter.post(
  "/project-reports/upsert",
  requireRole(["ADMIN", "PM", "MEMBER"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(upsertProjectReportSchema, req.body);
    res.status(201).json(await store.upsertProjectReport(input));
  })
);

reportsRouter.post(
  "/project-reports/generate-draft",
  requireRole(["ADMIN", "PM", "MEMBER"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(generateProjectReportSchema, req.body);
    res.status(201).json(await store.generateProjectReportDraft(input.projectId, input.reportType, input.period));
  })
);
