import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const parse = <T>(schema: z.ZodSchema<T>, payload: unknown) => schema.parse(payload);

export const ah =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

export const projectIdFromQuery = (req: Request) => req.query.projectId as string | undefined;
export const projectIdFromBody = (req: Request) => req.body?.projectId as string | undefined;
export const projectIdFromParams = (req: Request) => req.params.projectId;
