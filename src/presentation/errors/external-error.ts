// presentation/errors/external-error.ts
import { AppError } from "./base-error";
import { ErrorType } from "./error-types";

export class ExternalServiceError extends AppError {
  constructor(options: {
    message: string;
    service: string;
    code?: string;
    statusCode?: number;
    cause?: Error;
    metadata?: Record<string, any>;
  }) {
    super({
      type: ErrorType.EXTERNAL,
      statusCode: options.statusCode || 502,
      message: options.message,
      code: options.code || "EXTERNAL_SERVICE_ERROR",
      target: options.service,
      metadata: {
        ...options.metadata,
        service: options.service,
        cause: options.cause
          ? {
              message: options.cause.message,
              name: options.cause.name,
            }
          : undefined,
      },
    });
  }
}
