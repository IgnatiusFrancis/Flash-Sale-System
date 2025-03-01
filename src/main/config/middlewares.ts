import { Express } from "express";
import { bodyParser, contentType, cors } from "../middlewares";
import { Request, Response, NextFunction } from "express";
import { JwtAdapter } from "../../infra/criptography/jwt-adapter";

export const setupMiddlewares = (app: Express): void => {
  app.use(bodyParser);
  app.use(cors);
  app.use(contentType);
};

const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET!);

export const authMiddleware =
  (role?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = await jwtAdapter.verifyToken(token);
      req.user = decoded;
      console.log(decoded);
      if (role && decoded.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
