import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { findUserById, loginSchema, signToken, verifyUser } from "../../services/auth.js";
import { ah, parse } from "../shared/http.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  ah(async (req, res) => {
  const input = parse(loginSchema, req.body);
  const user = await verifyUser(input.username, input.password);
  if (!user) {
    res.status(401).json({ message: "账号或密码错误" });
    return;
  }

  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    }
  });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  ah(async (req, res) => {
    const user = req.auth ? await findUserById(req.auth.userId) : null;
    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    });
  })
);
