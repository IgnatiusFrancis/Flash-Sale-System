import { Express } from "express";
import {
  authMiddleware,
  bodyParser,
  contentType,
  cors,
  errorHandler,
  purchaseLimiter,
} from "../middlewares";

export const setupMiddlewares = (app: Express): void => {
  app.use(bodyParser);
  app.use(cors);
  app.use(contentType);
  app.use(purchaseLimiter);
  app.use(authMiddleware);
  app.use(errorHandler);
};
