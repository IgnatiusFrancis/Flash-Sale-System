import express from "express";
import http from "http";
import cron from "node-cron";
import { setupMiddlewares } from "./middlewares";
import { setupRoutes } from "./routes";
import { setupSocket } from "../../infra/webSocket";
import updateFlashSales from "../../infra/cronJob";

const app = express();
const server = http.createServer(app);

setupMiddlewares(app);
setupRoutes(app);
setupSocket(server);

// ✅ Start the cron job after setup
async function startCronJobs() {
  console.log("⏰ Scheduling Flash Sale Cron Job...");
  cron.schedule("* * * * * *", async () => {
    console.log("⏰ Running test cron job at", new Date().toISOString());
    await updateFlashSales();
  });
}

startCronJobs();

export default app;
