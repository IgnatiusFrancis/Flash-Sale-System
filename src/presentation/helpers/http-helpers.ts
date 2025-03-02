// presentation/helpers/http-helpers.ts
import { AppError, ServerError } from "../errors";
import { HttpResponse } from "../protocols/http";

export const success = (data: any, statusCode = 200): HttpResponse => ({
  statusCode,
  body: data,
});

export const created = (data: any): HttpResponse => success(data, 201);

export const noContent = (): HttpResponse => ({
  statusCode: 204,
  body: null,
});

export const error = (appError: AppError): HttpResponse => ({
  statusCode: appError.statusCode,
  body: appError.toJSON(),
});

export const handleError = (err: unknown): HttpResponse => {
  if (err instanceof AppError) {
    return error(err);
  }

  const serverError = new ServerError({
    message: err instanceof Error ? err.message : "Unknown error occurred",
    cause: err instanceof Error ? err : undefined,
    stack: err instanceof Error ? err.stack : undefined,
  });

  return error(serverError);
};
