// import { Request, Response } from "express";
// import { Controller, HttpRequest } from "../../presentation/protocols";

// export const adaptRoute = (controller: Controller) => {
//   return async (req: Request, res: Response) => {
//     const httpRequest: HttpRequest = {
//       body: req.body,
//     };
//     const httpResponse = await controller.handle(httpRequest);

//     if (httpResponse.statusCode === 200) {
//       res.status(httpResponse.statusCode).json(httpResponse.body);
//     }
//     res.status(httpResponse.statusCode).json(httpResponse.body.message);
//   };
// };

// main/adapter/express-route-adapter.ts
import { Controller } from "../../presentation/protocols";
import { Request, Response } from "express";

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    try {
      const httpRequest = {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
        user: req.user, // If you're using authentication
      };

      const httpResponse = await controller.handle(httpRequest);

      // Send the appropriate status code
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
