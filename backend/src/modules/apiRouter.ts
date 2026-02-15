import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { changesRouter } from "./changes/router.js";
import { metaRouter } from "./meta/router.js";
import { milestonesRouter } from "./milestones/router.js";
import { progressRecordsRouter } from "./progress-records/router.js";
import { projectsRouter } from "./projects/router.js";
import { risksRouter } from "./risks/router.js";
import { statusAssessmentsRouter } from "./status-assessments/router.js";
import { systemRouter } from "./system/router.js";
import { usersRouter } from "./users/router.js";
import { wbsRouter } from "./wbs/router.js";

export const apiRouter = Router();

apiRouter.use(requireAuth);
apiRouter.use(metaRouter);
apiRouter.use(usersRouter);
apiRouter.use(projectsRouter);
apiRouter.use(wbsRouter);
apiRouter.use(milestonesRouter);
apiRouter.use(progressRecordsRouter);
apiRouter.use(statusAssessmentsRouter);
apiRouter.use(risksRouter);
apiRouter.use(changesRouter);
apiRouter.use(systemRouter);
