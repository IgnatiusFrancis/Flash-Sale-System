//main/config/app.ts
import express from "express";
import cron from "node-cron";
import { setupMiddlewares } from "./middlewares";
import { setupRoutes } from "./routes";
import updateFlashSales from "../../infra/cronJob";
import { errorHandler } from "../middlewares/error-handler";

const app = express();

setupMiddlewares(app);
setupRoutes(app);

app.use(errorHandler);

app.use("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API!" });
});

// Handle 404 Not Found
app.use("/*", (req, res) => {
  return res.status(404).json("Endpoint not found");
});

// Start the cron job after setup
async function startCronJobs() {
  console.log("⏰ Scheduling Flash Sale Cron Job...");
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Running test cron job at", new Date().toISOString());
    await updateFlashSales();
  });
}

startCronJobs();

export default app;
