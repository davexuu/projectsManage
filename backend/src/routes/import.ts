import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { parseImportInput, previewExcel } from "../services/excelImporter.js";
import { commitExcel } from "../services/importCommit.js";

export const importRouter = Router();

importRouter.post("/preview", requireAuth, requireRole(["ADMIN", "PM"]), (req, res) => {
  const { filePath } = parseImportInput(req.body);
  const result = previewExcel(filePath);
  return res.json(result);
});

importRouter.post("/commit", requireAuth, requireRole(["ADMIN", "PM"]), async (req, res, next) => {
  try {
    const { filePath } = parseImportInput(req.body);
    const result = await commitExcel(filePath, req.auth?.userId);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});
