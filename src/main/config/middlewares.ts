import { Express } from "express";
import { bodyParser, contentType, cors } from "../middlewares";

export const setupMiddlewares = (app: Express): void => {
  app.use(bodyParser);
  app.use(cors);
  app.use(contentType);
};

import { Request, Response, NextFunction } from "express";
import { JwtAdapter } from "../../infra/criptography/jwt-adapter";
import env from "./env";
import {
  AuthenticationError,
  AuthorizationError,
} from "../../presentation/errors";
import { handleError } from "../../presentation/helpers/http-helpers";
import { AccountMongoRepository } from "../../infra/repositories/user-repository/user";

const jwtAdapter = new JwtAdapter(env.secret_key);
const accountRepository = new AccountMongoRepository();

export const authMiddleware =
  (role?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new AuthenticationError({
          message: "Invalid token",
          code: "INVALID_TOKEN",
          details: [
            {
              code: "AUTH_FAILED",
              message: "Token is required",
              target: "Authentication",
            },
          ],
        });
      }

      const decoded = await jwtAdapter.verifyToken(token);
      req.user = decoded;

      // Check if user exists in the database
      const user = await accountRepository.findById(decoded?.id);
      if (!user) {
        throw new AuthenticationError({
          message: "User not found",
          code: "USER_NOT_FOUND",
          details: [
            {
              code: "AUTH_FAILED",
              message: "User does not exist",
              target: "Authentication",
            },
          ],
        });
      }

      // Check user role if required
      if (role && user.role !== role) {
        throw new AuthorizationError({
          message: "Forbidden",
          code: "NOT_AUTHORIZED",
          details: [
            {
              code: "AUTH_FAILED",
              message: "Insufficient permissions",
              target: "Authorization",
            },
          ],
        });
      }

      next();
    } catch (error) {
      return res.status(401).json(handleError(error));
    }
  };
