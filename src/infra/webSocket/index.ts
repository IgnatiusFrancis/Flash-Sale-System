import { Server, Socket } from "socket.io";
import { JwtAdapter } from "../criptography/jwt-adapter";
import env from "../../main/config/env";
// import { JwtAdapter } from "../adapters/jwt-adapter";
// import { ProductModel } from "../models/Product";
// import { FlashSaleModel } from "../models/FlashSale";
// import { processPurchase } from "../services/flashSaleService";

const jwtAdapter = new JwtAdapter(env.secret_key);

export function setupSocket(io: Server) {
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

      // Emit initial flash sale state
      //   const flashSale = await FlashSaleModel.findOne({ active: true });
      //   if (flashSale) {
      //     const product = await ProductModel.findById(flashSale.productId);
      //     if (product) {
      //       socket.emit("flashSaleUpdate", {
      //         productId: product._id,
      //         availableUnits: product.availableUnits,
      //         status: product.status,
      //       });
      //     }
      //   }

      // Handle real-time purchase requests
      //   socket.on("purchase", async ({ productId, quantity }) => {
      //     try {
      //       const purchase = await processPurchase(userId, productId, quantity, io);
      //       io.emit("flashSaleUpdate", {
      //         productId: productId,
      //         availableUnits: purchase.remainingStock,
      //       });

      //       io.to(userId).emit("purchaseSuccess", {
      //         message: "Purchase successful!",
      //         purchase,
      //       });
      //     } catch (error) {
      //       io.to(userId).emit("purchaseError", { message: error.message });
      //     }
      //   });

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
      });
    } catch (error) {
      console.error("Socket connection error:", error);
      socket.disconnect(true);
    }
  });
}
