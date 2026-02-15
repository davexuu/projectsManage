import { Router } from "express";
import { requireRole } from "../../middleware/auth.js";
import { listUsersBasic } from "../../services/auth.js";
import { ah } from "../shared/http.js";

export const usersRouter = Router();

usersRouter.get(
  "/users",
  requireRole(["ADMIN", "PM"]),
  ah(async (_req, res) => {
    res.json(await listUsersBasic());
  })
);
