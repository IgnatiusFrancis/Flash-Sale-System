import { v4 as uuidv4 } from "uuid";
import logger from "../../utils/logger";
import redisClient from "../Database/redis";

export class DistributedLock {
  private readonly lockKey: string;
  private readonly lockValue: string;
  private readonly ttl: number; // in seconds

  constructor(resource: string, ttl: number = 10) {
    this.lockKey = `lock:${resource}`;
    this.lockValue = uuidv4();
    this.ttl = ttl;
  }

  async acquire(): Promise<boolean> {
    try {
      const result = await redisClient.set(
        this.lockKey,
        this.lockValue,
        "EX",
        this.ttl,
        "NX"
      );
      return result === "OK";
    } catch (error) {
      logger.error({
        message: "Error acquiring distributed lock",
        error: error instanceof Error ? error.message : String(error),
        data: { lockKey: this.lockKey },
      });
      return false;
    }
  }

  async release(): Promise<boolean> {
    try {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await redisClient.eval(
        script,
        1,
        this.lockKey,
        this.lockValue
      );
      return result === 1;
    } catch (error) {
      logger.error({
        message: "Error releasing distributed lock",
        error: error instanceof Error ? error.message : String(error),
        data: { lockKey: this.lockKey },
      });
      return false;
    }
  }
}
