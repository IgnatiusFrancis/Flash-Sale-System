// presentation/errors/business-error.ts
import { AppError } from "./base-error";
import { ErrorType } from "./error-types";

export class BusinessError extends AppError {
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
      type: ErrorType.BUSINESS,
      statusCode: 422,
      message: options.message,
      code: options.code || "BUSINESS_RULE_ERROR",
      target: options.target,
      details: options.details,
      metadata: options.metadata,
    });
  }
}
