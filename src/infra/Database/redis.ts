import Redis from "ioredis";
import env from "../../main/config/env";

// Load environment variables
const REDIS_HOST = env.redis_host || "127.0.0.1";
const REDIS_PORT = parseInt(env.redis_port || "6379", 10);
const REDIS_PASSWORD = env.redis_password || undefined;

const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redisClient.on("connect", () => {
  console.log("🚀 Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redisClient;
