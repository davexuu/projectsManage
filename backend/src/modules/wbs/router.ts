import { AccessRole } from "@prisma/client";
import { Router } from "express";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { createWbsSchema } from "../../services/validators.js";
import { ah, parse, projectIdFromBody, projectIdFromQuery } from "../shared/http.js";
import { allowedProjectIds, ensureReadableOr403 } from "../shared/projectAccess.js";

export const wbsRouter = Router();

wbsRouter.get(
  "/wbs",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if (!(await ensureReadableOr403(req, res, projectId))) return;
    res.json(await store.listWbs(projectId, await allowedProjectIds(req)));
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

wbsRouter.delete(
  "/wbs/:id",
  requireRole(["ADMIN", "PM"]),
  requireProjectAccess(projectIdFromQuery, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    await store.deleteWbs(req.params.id);
    res.json({ ok: true });
  })
);
