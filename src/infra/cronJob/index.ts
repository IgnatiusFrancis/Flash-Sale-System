// import { FlashSaleModel, FlashSaleStatus } from "../../domain/models/flashSale";
// import redisClient from "../Database/redis";
// //import { io } from "../webSocket";
// import env from "../../main/config/env";

// const FLASH_SALE_LOCK_KEY = env.redis_lock_key;

// const updateFlashSales = async () => {
//   const now = new Date();

//   try {
//     // Prevent multiple instances from running at the same time
//     const isLocked = await redisClient.get(FLASH_SALE_LOCK_KEY);
//     // console.log("isLocked:", isLocked);
//     if (isLocked) return;
//     await redisClient.set(FLASH_SALE_LOCK_KEY, "locked", "EX", 60); // Lock for 60 seconds

//     // Start pending flash sales
//     const startedSales = await FlashSaleModel.updateMany(
//       {
//         status: FlashSaleStatus.PENDING,
//         startTime: { $lte: now },
//         availableUnits: { $gt: 0 },
//       },
//       { status: FlashSaleStatus.ACTIVE }
//     );
//     console.log("startedSales:", startedSales);
//     if (startedSales.modifiedCount > 0) {
//       console.log(`🚀 ${startedSales.modifiedCount} Flash Sale(s) started!`);
//       //io.emit("flashSaleStarted", { message: "New Flash Sale is live!" });
//     }

//     // End expired or sold-out flash sales
//     const endedSales = await FlashSaleModel.updateMany(
//       {
//         status: FlashSaleStatus.ACTIVE,
//         $or: [{ endTime: { $lte: now } }, { availableUnits: 0 }],
//       },
//       { status: FlashSaleStatus.ENDED, endTime: now }
//     );
//     console.log("endedSales:", endedSales);
//     if (endedSales.modifiedCount > 0) {
//       console.log(`🏁 ${endedSales.modifiedCount} Flash Sale(s) ended!`);
//       // io.emit("flashSaleEnded", { message: "A Flash Sale has ended!" });
//     }

//     // Release the lock after execution
//     await redisClient.del(FLASH_SALE_LOCK_KEY);
//   } catch (error) {
//     console.error("❌ Error updating flash sales:", error);
//     await redisClient.del(FLASH_SALE_LOCK_KEY);
//   }
// };

// export default updateFlashSales;

import { FlashSaleModel, FlashSaleStatus } from "../../domain/models/flashSale";
import redisClient from "../Database/redis";
import {
  broadcastFlashSaleStarted,
  broadcastFlashSaleEnded,
} from "../webSocket";
import env from "../../main/config/env";

const FLASH_SALE_LOCK_KEY = env.redis_lock_key;

const updateFlashSales = async () => {
  const now = new Date();

  try {
    // Prevent multiple instances from running at the same time using Redis lock
    const isLocked = await redisClient.get(FLASH_SALE_LOCK_KEY);
    if (isLocked) return;
    await redisClient.set(FLASH_SALE_LOCK_KEY, "locked", "EX", 60); // Lock for 60 seconds

    // Start pending flash sales
    const pendingSales = await FlashSaleModel.find({
      status: FlashSaleStatus.PENDING,
      startTime: { $lte: now },
      availableUnits: { $gt: 0 },
    });

    // Update statuses and broadcast individually to ensure proper event handling
    for (const sale of pendingSales) {
      sale.status = FlashSaleStatus.ACTIVE;
      await sale.save();
      await broadcastFlashSaleStarted(sale._id.toString());
      console.log(` Flash Sale started: ${sale._id}`);
    }

    // Find active sales that should end
    const activeSales = await FlashSaleModel.find({
      status: FlashSaleStatus.ACTIVE,
      $or: [{ endTime: { $lte: now } }, { availableUnits: 0 }],
    });

    // Update statuses and broadcast individually with reason
    for (const sale of activeSales) {
      sale.status = FlashSaleStatus.ENDED;
      if (sale.endTime > now) {
        // Ended due to stock depletion
        await broadcastFlashSaleEnded(sale._id.toString(), "sold-out");
        console.log(` Flash Sale ended (sold out): ${sale._id}`);
      } else {
        // Ended due to time expiration
        await broadcastFlashSaleEnded(sale._id.toString(), "time-expired");
        console.log(` Flash Sale ended (time expired): ${sale._id}`);
      }
      await sale.save();
    }

    // Release the lock after execution
    await redisClient.del(FLASH_SALE_LOCK_KEY);
  } catch (error) {
    console.error(" Error updating flash sales:", error);
    // Always release the lock even if there's an error
    await redisClient.del(FLASH_SALE_LOCK_KEY);
  }
};

export default updateFlashSales;
