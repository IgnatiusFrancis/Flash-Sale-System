import { Request, Response, NextFunction } from "express";
import { JwtAdapter } from "../../infra/criptography/jwt-adapter";
import env from "../config/env";
import { AccountMongoRepository } from "../../infra/repositories/user-repository/user";

const jwtAdapter = new JwtAdapter(env.secret_key);
const accountRepository = new AccountMongoRepository();

export const authMiddleware =
  (role?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          error: {
            type: "AUTHENTICATION",
            code: "INVALID_TOKEN",
            message: "Invalid token",
            details: [
              {
                code: "AUTH_FAILED",
                message: "Token is required",
                target: "Authentication",
              },
            ],
            timestamp: new Date().toISOString(),
          },
        });
      }

      const decoded = await jwtAdapter.verifyToken(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({
          error: {
            type: "AUTHENTICATION",
            code: "INVALID_TOKEN",
            message: "Invalid token",
            details: [
              {
                code: "AUTH_FAILED",
                message: "Token is invalid or expired",
                target: "Authentication",
              },
            ],
            timestamp: new Date().toISOString(),
          },
        });
      }

      const user = await accountRepository.findById(decoded?.id);
      if (!user) {
        return res.status(401).json({
          error: {
            type: "AUTHENTICATION",
            code: "USER_NOT_FOUND",
            message: "User not found",
            details: [
              {
                code: "AUTH_FAILED",
                message: "User does not exist",
                target: "Authentication",
              },
            ],
            timestamp: new Date().toISOString(),
          },
        });
      }

      if (role && user.role !== role) {
        return res.status(403).json({
          error: {
            type: "AUTHORIZATION",
            code: "NOT_AUTHORIZED",
            message: "Forbidden",
            details: [
              {
                code: "AUTH_FAILED",
                message: "Insufficient permissions",
                target: "Authorization",
              },
            ],
            timestamp: new Date().toISOString(),
          },
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("🔒 Auth Middleware Error:", error);
      return res.status(401).json({
        error: {
          type: "AUTHENTICATION",
          code: "UNKNOWN_ERROR",
          message: "An unexpected authentication error occurred",
          details: [
            {
              code: "AUTH_FAILED",
              message: error.message || "Authentication failed",
              target: "Authentication",
            },
          ],
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
