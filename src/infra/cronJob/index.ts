import { FlashSaleModel, FlashSaleStatus } from "../../domain/models/flashSale";
import redisClient from "../Database/redis";
import { io } from "../webSocket";
import env from "../../main/config/env";

const FLASH_SALE_LOCK_KEY = env.redis_lock_key;

const updateFlashSales = async () => {
  const now = new Date();

  try {
    // Prevent multiple instances from running at the same time
    const isLocked = await redisClient.get(FLASH_SALE_LOCK_KEY);
    // console.log("isLocked:", isLocked);
    if (isLocked) return;
    await redisClient.set(FLASH_SALE_LOCK_KEY, "locked", "EX", 60); // Lock for 60 seconds

    // Start pending flash sales
    const startedSales = await FlashSaleModel.updateMany(
      {
        status: FlashSaleStatus.PENDING,
        startTime: { $lte: now },
        availableUnits: { $gt: 0 },
      },
      { status: FlashSaleStatus.ACTIVE }
    );
    // console.log("startedSales:", startedSales);
    if (startedSales.modifiedCount > 0) {
      console.log(`🚀 ${startedSales.modifiedCount} Flash Sale(s) started!`);
      io.emit("flashSaleStarted", { message: "New Flash Sale is live!" });
    }

    // End expired or sold-out flash sales
    const endedSales = await FlashSaleModel.updateMany(
      {
        status: FlashSaleStatus.ACTIVE,
        $or: [{ endTime: { $lte: now } }, { availableUnits: 0 }],
      },
      { status: FlashSaleStatus.ENDED, endTime: now }
    );
    // console.log("endedSales:", endedSales);
    if (endedSales.modifiedCount > 0) {
      console.log(`🏁 ${endedSales.modifiedCount} Flash Sale(s) ended!`);
      io.emit("flashSaleEnded", { message: "A Flash Sale has ended!" });
    }

    // Release the lock after execution
    await redisClient.del(FLASH_SALE_LOCK_KEY);
  } catch (error) {
    console.error("❌ Error updating flash sales:", error);
    await redisClient.del(FLASH_SALE_LOCK_KEY);
  }
};

export default updateFlashSales;
