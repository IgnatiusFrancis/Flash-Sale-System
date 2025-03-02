// presentation/errors/auth-error.ts
import { AppError } from "./base-error";
import { ErrorType } from "./error-types";

export class AuthenticationError extends AppError {
  constructor(options: {
    message?: string;
    code?: string;
    details?: Array<{
      code: string;
      message: string;
      target?: string;
    }>;
    metadata?: Record<string, any>;
  }) {
    super({
      type: ErrorType.AUTHENTICATION,
      statusCode: 401,
      message: options.message || "Authentication required",
      code: options.code || "AUTHENTICATION_REQUIRED",
      details: options.details,
      metadata: options.metadata,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(options: {
    message?: string;
    code?: string;
    resource?: string;
    details?: Array<{
      code: string;
      message: string;
      target?: string;
    }>;
    metadata?: Record<string, any>;
  }) {
    super({
      type: ErrorType.AUTHORIZATION,
      statusCode: 403,
      message: options.message || "Not authorized",
      code: options.code || "NOT_AUTHORIZED",
      target: options.resource,
      details: options.details,
      metadata: options.metadata,
    });
  }
}
