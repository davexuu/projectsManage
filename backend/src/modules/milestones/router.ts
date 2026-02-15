import { AccessRole } from "@prisma/client";
import { Router } from "express";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { createMilestoneSchema } from "../../services/validators.js";
import { ah, parse, projectIdFromBody, projectIdFromQuery } from "../shared/http.js";
import { allowedProjectIds, ensureReadableOr403 } from "../shared/projectAccess.js";

export const milestonesRouter = Router();

milestonesRouter.get(
  "/milestones",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if (!(await ensureReadableOr403(req, res, projectId))) return;
    res.json(await store.listMilestones(projectId, await allowedProjectIds(req)));
  })
);

milestonesRouter.post(
  "/milestones",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createMilestoneSchema, req.body);
    res.status(201).json(await store.createMilestone(input));
  })
);

milestonesRouter.put(
  "/milestones/:id",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createMilestoneSchema, req.body);
    res.json(await store.updateMilestone(req.params.id, input));
  })
);
