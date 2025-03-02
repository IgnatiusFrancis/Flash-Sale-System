// presentation/errors/not-found-error.ts
import { AppError } from "./base-error";
import { ErrorType } from "./error-types";

export class NotFoundError extends AppError {
  constructor(options: {
    message?: string;
    resource?: string;
    code?: string;
    metadata?: Record<string, any>;
  }) {
    super({
      type: ErrorType.NOT_FOUND,
      statusCode: 404,
      message:
        options.message ||
        `Resource not found: ${options.resource || "Unknown"}`,
      code: options.code || "RESOURCE_NOT_FOUND",
      target: options.resource,
      metadata: options.metadata,
    });
  }
}
