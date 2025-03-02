// presentation/errors/base-error.ts
import { ErrorType } from "./error-types";

export interface ErrorDetails {
  code: string;
  message: string;
  target?: string;
  details?: ErrorDetails[];
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly target?: string;
  public readonly details?: ErrorDetails[];
  public readonly metadata?: Record<string, any>;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(options: {
    type: ErrorType;
    statusCode: number;
    message: string;
    code: string;
    target?: string;
    details?: ErrorDetails[];
    metadata?: Record<string, any>;
    isOperational?: boolean;
    stack?: string;
  }) {
    super(options.message);

    this.type = options.type;
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.target = options.target;
    this.details = options.details;
    this.metadata = options.metadata;
    this.isOperational = options.isOperational ?? true;
    this.timestamp = new Date();

    this.name = this.constructor.name;

    if (options.stack) {
      this.stack = options.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, any> {
    return {
      error: {
        type: this.type,
        code: this.code,
        message: this.message,
        target: this.target,
        details: this.details,
        timestamp: this.timestamp.toISOString(),
      },
    };
  }
}
