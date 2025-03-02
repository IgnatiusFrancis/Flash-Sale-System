// presentation/errors/server-error.ts
import { AppError } from "./base-error";
import { ErrorType } from "./error-types";

export class ServerError extends AppError {
  constructor(options: {
    message?: string;
    code?: string;
    cause?: Error;
    stack?: string;
    metadata?: Record<string, any>;
  }) {
    super({
      type: ErrorType.SERVER,
      statusCode: 500,
      message: options.message || "Internal server error",
      code: options.code || "INTERNAL_SERVER_ERROR",
      metadata: {
        ...options.metadata,
        cause: options.cause
          ? {
              message: options.cause.message,
              name: options.cause.name,
            }
          : undefined,
      },
      isOperational: false,
      stack: options.stack,
    });
  }
}
