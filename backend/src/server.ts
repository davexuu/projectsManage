import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZodError } from "zod";
import { apiRouter } from "./modules/apiRouter.js";
import { authRouter } from "./modules/auth/router.js";
import { importRouter } from "./modules/import/router.js";
import { ensureSystemSeedData } from "./services/bootstrap.js";
import { BusinessError } from "./services/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/import", importRouter);
app.use("/api", apiRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "参数校验失败", errors: err.issues });
  }
  if (err instanceof BusinessError) {
    return res.status(err.status).json({
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {})
    });
  }

  const message = err instanceof Error ? err.message : "服务内部错误";
  return res.status(500).json({ message });
});

async function start() {
  await ensureSystemSeedData();
  app.listen(port, () => {
    console.log(`PMP backend running at http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("后端启动失败:", err);
  process.exit(1);
});
