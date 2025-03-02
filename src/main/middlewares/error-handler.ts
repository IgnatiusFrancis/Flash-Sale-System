import { Request, Response, NextFunction } from "express";
import { AppError, ServerError } from "../../presentation/errors";
import logger from "../../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detailed error information
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({
        message: "Non-operational error occurred",
        error: err,
        stack: err.stack,
        path: req.path,
        method: req.method,
        requestId: req.headers["x-request-id"],
      });
    } else {
      logger.warn({
        message: err.message,
        errorType: err.type,
        errorCode: err.code,
        path: req.path,
        method: req.method,
        requestId: req.headers["x-request-id"],
      });
    }

    return res.status(err.statusCode).json(err.toJSON());
  }

  // For unknown errors, convert to ServerError
  const serverError = new ServerError({
    message: err.message || "An unexpected error occurred",
    cause: err,
    stack: err.stack,
  });

  logger.error({
    message: "Unhandled error occurred",
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.headers["x-request-id"],
  });

  return res.status(serverError.statusCode).json(serverError.toJSON());
};
