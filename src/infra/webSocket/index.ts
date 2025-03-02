import { Server, Socket } from "socket.io";
import { JwtAdapter } from "../criptography/jwt-adapter";
import env from "../../main/config/env";
import redisClient from "../Database/redis";
import { FlashSaleModel, FlashSaleStatus } from "../../domain/models/flashSale";

const jwtAdapter = new JwtAdapter(env.secret_key);
let io: Server;

export function setupSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:4000", "http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    },
  });

  io.on("connection", async (socket: Socket) => {
    try {
      const authHeader = socket.handshake.headers.authorization as string;
      if (!authHeader) {
        console.warn("Missing authorization header.");
        socket.disconnect(true);
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = await jwtAdapter.verifyToken(token);
      if (!decoded || !decoded.id) {
        console.warn("Invalid token.");
        socket.disconnect(true);
        return;
      }

      const userId = decoded.id.toString();
      socket.join(userId);

      console.log(`User ${userId} connected`);

      // Emit cached flash sale state (if available)
      const cachedSale = await redisClient.get("activeFlashSale");
      if (cachedSale) {
        socket.emit("flashSaleUpdate", JSON.parse(cachedSale));
      } else {
        // Fetch from DB if cache is empty
        const flashSale = await FlashSaleModel.findOne({
          status: FlashSaleStatus.ACTIVE,
        });
        if (flashSale) {
          await redisClient.set(
            "activeFlashSale",
            JSON.stringify(flashSale),
            "EX",
            60
          ); // Cache for 1 minute
          socket.emit("flashSaleUpdate", flashSale);
        }
      }

      // Listen for purchase events (optional)
      socket.on("purchase", async ({ productId, quantity }) => {
        try {
          // Handle purchase logic (e.g., reducing stock)
          const flashSale = await FlashSaleModel.findOne({
            product: productId,
            status: FlashSaleStatus.ACTIVE,
          });

          if (!flashSale || flashSale.availableUnits < quantity) {
            socket.emit("purchaseError", {
              message: "Not enough stock available.",
            });
            return;
          }

          flashSale.availableUnits -= quantity;
          if (flashSale.availableUnits === 0) {
            flashSale.status = FlashSaleStatus.ENDED;
          }
          await flashSale.save();

          // Update Redis Cache
          await redisClient.set(
            "activeFlashSale",
            JSON.stringify(flashSale),
            "EX",
            60
          );

          io.emit("flashSaleUpdate", flashSale);
          socket.emit("purchaseSuccess", {
            message: "Purchase successful!",
            flashSale,
          });
        } catch (error) {
          socket.emit("purchaseError", { message: error.message });
        }
      });

      socket.on("disconnect", () => {
        console.log(`❌ User ${userId} disconnected`);
      });
    } catch (error) {
      console.error("❌ Socket connection error:", error);
      socket.disconnect(true);
    }
  });
}

export { io };
