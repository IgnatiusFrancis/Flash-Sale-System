//presentation/errors/forbidden-error.ts

import { AppError } from "./base-error";
import { ErrorType } from "./error-types";

export class ForbiddenError extends AppError {
  constructor(options: {
    message?: string;
    resource?: string;
    code?: string;
    metadata?: Record<string, any>;
  }) {
    super({
      type: ErrorType.FORBIDDEN,
      statusCode: 403,
      message: options.message || `Forbidden: ${options.resource || "Unknown"}`,
      code: options.code || "RESOURCE_FORBIDDEN",
      target: options.resource,
      metadata: options.metadata,
    });
  }
}
