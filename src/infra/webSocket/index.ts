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
      origin: ["http://localhost:5050"],
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    },
  });

  io.on("connection", async (socket: Socket) => {
    try {
      const authHeader = socket.handshake.headers.authorization as string;
      if (!authHeader) {
        console.warn("Missing authorization header.");
        socket.emit("error", { message: "Missing authorization header." });
        socket.disconnect(true);
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = await jwtAdapter.verifyToken(token);
      if (!decoded || !decoded.id) {
        console.warn("Invalid token.");
        socket.emit("error", { message: "Invalid token." });
        socket.disconnect(true);
        return;
      }

      const userId = decoded.id.toString();
      socket.join(userId); // User-specific room
      socket.join("all-users"); // Global room for all users

      console.log(`User ${userId} connected`);

      // Handle joining a specific flash sale room
      socket.on("joinFlashSale", async ({ flashSaleId }) => {
        try {
          // Join the specific flash sale room
          socket.join(`flashsale:${flashSaleId}`);

          // Get current flash sale data and send to the user
          const flashSale = await FlashSaleModel.findById(flashSaleId);

          if (!flashSale) {
            socket.emit("error", { message: "Flash sale not found" });
          } else {
            socket.emit("flashSaleStatus", {
              id: flashSale._id,
              status: flashSale.status,
              availableUnits: flashSale.availableUnits,
              allocatedUnits: flashSale.allocatedUnits,
              startTime: flashSale.startTime,
              endTime: flashSale.endTime,
            });
          }

          console.log(`User ${userId} joined flash sale room: ${flashSaleId}`);
        } catch (error) {
          console.error("Error joining flash sale room:", error);
          socket.emit("error", { message: "Failed to join flash sale room" });
        }
      });

      // Handle leaving a specific flash sale room
      socket.on("leaveFlashSale", ({ flashSaleId }) => {
        socket.leave(`flashsale:${flashSaleId}`);
        console.log(`User ${userId} left flash sale room: ${flashSaleId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
        // Clean up is handled automatically by Socket.IO
      });
    } catch (error) {
      console.error("WebSocket authentication failed:", error);
      socket.disconnect(true);
    }
  });

  return io;
}

// Helper functions to broadcast updates

// Broadcast stock updates to all users in a flash sale room
export const broadcastStockUpdate = async (flashSaleId: string) => {
  try {
    const flashSale = await FlashSaleModel.findById(flashSaleId);
    if (flashSale) {
      io.to(`flashsale:${flashSaleId}`).emit("stockUpdate", {
        id: flashSale._id,
        availableUnits: flashSale.availableUnits,
        allocatedUnits: flashSale.allocatedUnits,
        status: flashSale.status,
      });
    }
  } catch (error) {
    console.error("Error broadcasting stock update:", error);
  }
};

// Broadcast flash sale started event
export const broadcastFlashSaleStarted = async (flashSaleId: string) => {
  try {
    const flashSale = await FlashSaleModel.findById(flashSaleId);
    if (flashSale) {
      io.to("all-users").emit("flashSaleStarted", {
        id: flashSale._id,
        message: "New Flash Sale is live!",
        availableUnits: flashSale.availableUnits,
        allocatedUnits: flashSale.allocatedUnits,
        endTime: flashSale.endTime,
      });
    }
  } catch (error) {
    console.error("Error broadcasting flash sale started:", error);
  }
};

// Broadcast flash sale ended event
export const broadcastFlashSaleEnded = async (
  flashSaleId: string,
  reason: "sold-out" | "time-expired"
) => {
  try {
    const message =
      reason === "sold-out"
        ? "Flash Sale has ended - All units sold out!"
        : "Flash Sale has ended - Time expired!";

    io.to(`flashsale:${flashSaleId}`).emit("flashSaleEnded", {
      id: flashSaleId,
      message,
      reason,
    });
  } catch (error) {
    console.error("Error broadcasting flash sale ended:", error);
  }
};

// Function to update cron job to use WebSocket broadcasts
export const updateCronJobEmitters = () => {
  // This function will be used to integrate your WebSocket broadcasts with the cron job
  return {
    emitFlashSaleStarted: broadcastFlashSaleStarted,
    emitFlashSaleEnded: broadcastFlashSaleEnded,
  };
};

export { io };
