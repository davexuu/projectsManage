import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../../middleware/auth.js";
import { store } from "../../services/store.js";
import { ah, parse } from "../shared/http.js";
import {
  createSystemEntityRow,
  deleteSystemEntityRow,
  getSystemEntityRow,
  listSystemEntityMetas,
  listSystemEntityRows,
  resolveEntity,
  updateSystemEntityRow
} from "./entities.js";

const orgCreateSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().min(1).optional()
});

const orgRenameSchema = z.object({
  name: z.string().min(1)
});

const dictOptionSchema = z.object({
  value: z.string().min(1)
});

const entityKeySchema = z.object({
  entity: z.string().min(1)
});

export const systemRouter = Router();

systemRouter.get(
  "/system/entities",
  requireRole(["ADMIN", "PM"]),
  ah(async (_req, res) => {
    res.json(listSystemEntityMetas());
  })
);

systemRouter.get(
  "/system/entities/:entity",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const { entity } = parse(entityKeySchema, req.params);
    resolveEntity(entity);
    res.json(await listSystemEntityRows(entity));
  })
);

systemRouter.get(
  "/system/entities/:entity/:id",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const { entity } = parse(entityKeySchema, req.params);
    resolveEntity(entity);
    const row = await getSystemEntityRow(entity, req.params.id);
    if (!row) {
      res.status(404).json({ message: "记录不存在" });
      return;
    }
    res.json(row);
  })
);

systemRouter.post(
  "/system/entities/:entity",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const { entity } = parse(entityKeySchema, req.params);
    resolveEntity(entity);
    res.status(201).json(await createSystemEntityRow(entity, req.body));
  })
);

systemRouter.put(
  "/system/entities/:entity/:id",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const { entity } = parse(entityKeySchema, req.params);
    resolveEntity(entity);
    res.json(await updateSystemEntityRow(entity, req.params.id, req.body));
  })
);

systemRouter.delete(
  "/system/entities/:entity/:id",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const { entity } = parse(entityKeySchema, req.params);
    resolveEntity(entity);
    await deleteSystemEntityRow(entity, req.params.id);
    res.json({ ok: true });
  })
);

systemRouter.get(
  "/system/org-tree",
  requireRole(["ADMIN", "PM"]),
  ah(async (_req, res) => {
    res.json(await store.listOrganizationTree());
  })
);

systemRouter.post(
  "/system/org",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const input = parse(orgCreateSchema, req.body);
    res.status(201).json(await store.createOrganizationNode(input.name.trim(), input.parentId));
  })
);

systemRouter.put(
  "/system/org/:id",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const input = parse(orgRenameSchema, req.body);
    res.json(await store.renameOrganizationNode(req.params.id, input.name.trim()));
  })
);

systemRouter.delete(
  "/system/org/:id",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const deleted = await store.deleteOrganizationNode(req.params.id);
    res.json({ ok: true, deleted });
  })
);

systemRouter.get(
  "/system/dicts",
  requireRole(["ADMIN", "PM"]),
  ah(async (_req, res) => {
    res.json(await store.listDictionaryItems(["projectType", "year"]));
  })
);

systemRouter.post(
  "/system/dicts/:dictCode/options",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const input = parse(dictOptionSchema, req.body);
    await store.addDictionaryOption(req.params.dictCode, input.value.trim());
    res.status(201).json({ ok: true });
  })
);

systemRouter.delete(
  "/system/dicts/:dictCode/options",
  requireRole(["ADMIN", "PM"]),
  ah(async (req, res) => {
    const input = parse(dictOptionSchema, req.body);
    await store.removeDictionaryOption(req.params.dictCode, input.value.trim());
    res.json({ ok: true });
  })
);
