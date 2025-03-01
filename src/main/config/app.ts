//main/config/app.ts
import express from "express";
import http from "http";
import { setupMiddlewares } from "./middlewares";
import { setupRoutes } from "./routes";

const app = express();
const server = http.createServer(app);

// setupWebSocket(server);
setupMiddlewares(app);
setupRoutes(app);

export default app;
