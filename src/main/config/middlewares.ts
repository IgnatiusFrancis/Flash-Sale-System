// //config/middleware.ts
// import { Express } from "express";
// import { bodyParser, contentType, cors, errorHandler } from "../middlewares";

// export const setupMiddlewares = (app: Express): void => {
//   app.use(bodyParser);
//   app.use(cors);
//   app.use(contentType);
//   app.use(errorHandler);
//   app.use((req, res, next) => {
//     req.ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
//     req.userAgent = req.headers["user-agent"];
//     next();
//   });

// };

// config/middleware.ts
import { Express, Request, Response, NextFunction } from "express";
import { bodyParser, contentType, cors, errorHandler } from "../middlewares";

export const setupMiddlewares = (app: Express): void => {
  app.use(bodyParser);
  app.use(cors);
  app.use(contentType);
  app.use(errorHandler);

  // Middleware to extract IP address and user agent
  app.use((req: Request, res: Response, next: NextFunction) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    req.ipAddress =
      typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : Array.isArray(forwardedFor) && forwardedFor.length > 0
        ? forwardedFor[0].split(",")[0].trim()
        : req.socket.remoteAddress || "unknown";
    req.userAgent = req.headers["user-agent"] || "unknown";
    next();
  });
};
