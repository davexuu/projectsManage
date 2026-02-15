import { AccessRole } from "@prisma/client";
import { Router } from "express";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { createStatusAssessmentSchema } from "../../services/validators.js";
import { ah, parse, projectIdFromBody, projectIdFromQuery } from "../shared/http.js";
import { allowedProjectIds, ensureReadableOr403 } from "../shared/projectAccess.js";

export const statusAssessmentsRouter = Router();

statusAssessmentsRouter.get(
  "/status-assessments",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if (!(await ensureReadableOr403(req, res, projectId))) return;
    res.json(await store.listStatusAssessments(projectId, await allowedProjectIds(req)));
  })
);

statusAssessmentsRouter.post(
  "/status-assessments",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createStatusAssessmentSchema, req.body);
    res.status(201).json(await store.createStatusAssessment(input));
  })
);

statusAssessmentsRouter.put(
  "/status-assessments/:id",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createStatusAssessmentSchema, req.body);
    res.json(await store.updateStatusAssessment(req.params.id, input));
  })
);

statusAssessmentsRouter.delete(
  "/status-assessments/:id",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromQuery, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    await store.deleteStatusAssessment(req.params.id);
    res.json({ ok: true });
  })
);
