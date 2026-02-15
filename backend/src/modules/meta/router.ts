import { Router } from "express";
import { formSchemas } from "../../meta/formSchemas.js";

export const metaRouter = Router();

metaRouter.get("/meta/forms", (_req, res) => {
  res.json(formSchemas);
});
