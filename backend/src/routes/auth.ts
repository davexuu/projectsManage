import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { findUserById, loginSchema, signToken, verifyUser } from "../services/auth.js";

const parse = <T>(schema: z.ZodSchema<T>, payload: unknown) => schema.parse(payload);

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
  const input = parse(loginSchema, req.body);
  const user = await verifyUser(input.username, input.password);
  if (!user) {
    return res.status(401).json({ message: "账号或密码错误" });
  }

  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    }
  });
  } catch (err) {
    return next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = req.auth ? await findUserById(req.auth.userId) : null;
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }
    return res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    });
  } catch (err) {
    return next(err);
  }
});
