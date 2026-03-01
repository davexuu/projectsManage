import { AccessRole } from "@prisma/client";
import { Router } from "express";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import type { TaskStatus } from "../../domain/types.js";
import { store } from "../../services/store.js";
import {
  createWbsBatchSchema,
  createWbsSchema,
  quickWbsSuggestionSchema,
  updateWbsStatusSchema,
  validateWbsPlanSchema
} from "../../services/validators.js";
import { ah, parse, projectIdFromBody, projectIdFromQuery } from "../shared/http.js";
import { allowedProjectIds, ensureReadableOr403 } from "../shared/projectAccess.js";

export const wbsRouter = Router();

wbsRouter.get(
  "/wbs",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if (!(await ensureReadableOr403(req, res, projectId))) return;
    const stage = typeof req.query.stage === "string" ? req.query.stage : undefined;
    const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;
    res.json(await store.listWbs(projectId, await allowedProjectIds(req), { stage, startDate, endDate }));
  })
);

wbsRouter.post(
  "/wbs/quick-suggestions",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(quickWbsSuggestionSchema, req.body);
    res.json(await store.generateQuickWbsSuggestions(input));
  })
);

wbsRouter.post(
  "/wbs",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createWbsSchema, req.body);
    res.status(201).json(await store.createWbs(input));
  })
);

wbsRouter.put(
  "/wbs/:id",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createWbsSchema, req.body);
    res.json(await store.updateWbs(req.params.id, input));
  })
);

wbsRouter.post(
  "/wbs/batch",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createWbsBatchSchema, req.body);
    const items = input.items.map((item) => ({
      ...item,
      projectId: input.projectId
    }));
    res.status(201).json(await store.batchCreateWbs({ projectId: input.projectId, items }));
  })
);

wbsRouter.post(
  "/wbs/validate-plan",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(validateWbsPlanSchema, req.body);
    const items = input.items.map((item) => ({
      ...item,
      projectId: input.projectId
    }));
    res.json(await store.validateWbsPlan({ projectId: input.projectId, items }));
  })
);

wbsRouter.patch(
  "/wbs/:id/status",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(updateWbsStatusSchema, req.body);
    res.json(await store.updateWbsStatus(req.params.id, input.projectId, input.currentStatus as TaskStatus));
  })
);

wbsRouter.delete(
  "/wbs/:id",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromQuery, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    await store.deleteWbs(req.params.id);
    res.json({ ok: true });
  })
);
