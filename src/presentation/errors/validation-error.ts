// presentation/errors/validation-error.ts
import { AppError } from "./base-error";
import { ErrorType } from "./error-types";

export class ValidationError extends AppError {
  constructor(options: {
    message: string;
    code?: string;
    target?: string;
    details?: Array<{
      code: string;
      message: string;
      target?: string;
    }>;
    metadata?: Record<string, any>;
  }) {
    super({
      type: ErrorType.VALIDATION,
      statusCode: 400,
      message: options.message,
      code: options.code || "VALIDATION_ERROR",
      target: options.target,
      details: options.details,
      metadata: options.metadata,
    });
  }
}

export class MissingParamError extends ValidationError {
  constructor(paramName: string, metadata?: Record<string, any>) {
    super({
      message: `Missing required parameter: ${paramName}`,
      code: "MISSING_PARAMETER",
      target: paramName,
      metadata,
    });
  }
}

export class InvalidParamError extends ValidationError {
  constructor(
    paramName: string,
    reason?: string,
    metadata?: Record<string, any>
  ) {
    super({
      message: reason
        ? `Invalid parameter: ${paramName} - ${reason}`
        : `Invalid parameter: ${paramName}`,
      code: "INVALID_PARAMETER",
      target: paramName,
      metadata,
    });
  }
}
