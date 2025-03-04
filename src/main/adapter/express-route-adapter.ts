import { Controller } from "../../presentation/protocols";
import { Request, Response } from "express";

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    try {
      const httpRequest = {
        body: req.body,
        params: req.params as Record<string, string | undefined>,
        query: Object.fromEntries(
          Object.entries(req.query).map(([key, value]) => [
            key,
            Array.isArray(value)
              ? value.join(",")
              : (value as string | undefined),
          ])
        ) as Record<string, string | undefined>,
        headers: req.headers,
        user: req.user,
        ipAddress: (req as any).ipAddress,
        userAgent: (req as any).userAgent,
      };

      const httpResponse = await controller.handle(httpRequest);

      const statusCode = httpResponse.statusCode;

      // If no content, don't send a body
      if (statusCode === 204) {
        return res.status(statusCode).end();
      }

      // For all other responses, send the body
      return res.status(statusCode).json(httpResponse.body);
    } catch (error) {
      console.error("Uncaught error in route adapter:", error);

      // Return a 500 error if something unexpected happens
      return res.status(500).json({
        error: {
          type: "SERVER",
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      });
    }
  };
};
