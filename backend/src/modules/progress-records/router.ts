import { AccessRole } from "@prisma/client";
import { Router } from "express";
import { requireProjectAccess, requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { createProgressRecordSchema } from "../../services/validators.js";
import { ah, parse, projectIdFromBody, projectIdFromQuery } from "../shared/http.js";
import { allowedProjectIds, ensureReadableOr403 } from "../shared/projectAccess.js";

export const progressRecordsRouter = Router();

progressRecordsRouter.get(
  "/progress-records",
  ah(async (req, res) => {
    const projectId = projectIdFromQuery(req);
    if (!(await ensureReadableOr403(req, res, projectId))) return;
    res.json(await store.listProgressRecords(projectId, await allowedProjectIds(req)));
  })
);

progressRecordsRouter.post(
  "/progress-records",
  requireRole(["ADMIN", "PM", "MEMBER"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createProgressRecordSchema, req.body);
    res.status(201).json(await store.createProgressRecord(input));
  })
);

progressRecordsRouter.put(
  "/progress-records/:id",
  requireRole(["ADMIN", "PM", "MEMBER"]),
  requireProjectAccess(projectIdFromBody, [AccessRole.OWNER, AccessRole.EDITOR]),
  ah(async (req, res) => {
    const input = parse(createProgressRecordSchema, req.body);
    res.json(await store.updateProgressRecord(req.params.id, input));
  })
);
