import { TransactionStatus } from "../../../domain/models/transaction";
import logger from "../../../utils/logger";
import {
  ForbiddenError,
  InvalidParamError,
  MissingParamError,
} from "../../errors";
import { created, handleError } from "../../helpers/http-helpers";
import {
  AddPurchase,
  Controller,
  DetectFraud,
  HttpRequest,
  HttpResponse,
} from "./purchase-protocols";

export class PurchaseController implements Controller {
  private readonly purchaseProduct: AddPurchase;
  private readonly fraudDetection: DetectFraud;

  constructor(purchaseProduct: AddPurchase, fraudDetection: DetectFraud) {
    this.purchaseProduct = purchaseProduct;
    this.fraudDetection = fraudDetection;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = httpRequest.user?.id;
      if (!userId) {
        throw new MissingParamError("userId");
      }

      const requiredFields = ["flashSaleId", "quantity"];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          throw new MissingParamError(field);
        }
      }

      const { flashSaleId, quantity } = httpRequest.body;

      if (quantity <= 0) {
        throw new InvalidParamError("quantity", "Must be at least 1");
      }

      const purchase = await this.purchaseProduct.purchaseProduct({
        flashSaleId,
        userId,
        quantity,
        purchaseTime: new Date(),
      });

      // Process transaction for fraud detection.
      const transaction = await this.fraudDetection.processTransaction({
        flashSaleId,
        userId,
        purchaseId: purchase.id,
        ipAddress: httpRequest.ipAddress || "unknown",
        userAgent: httpRequest.userAgent || "unknown",
        amount: quantity,
        timestamp: new Date(),
      });

      // Check if transaction was flagged as fraudulent
      if (transaction.status === TransactionStatus.FLAGGED) {
        logger.warn({
          message: "Potentially fraudulent purchase detected",
          data: {
            purchaseId: purchase._id,
            userId,
            fraudScore: transaction.fraudScore,
          },
        });

        throw new ForbiddenError({
          message: `Your account is temporarily restricted due to suspicious activity.`,
          code: "SUSPICIOUS_ACTIVITY",
          metadata: {
            status: transaction.status,
            flashSaleId: flashSaleId,
          },
        });
      }

      return created(purchase);
    } catch (error) {
      return handleError(error);
    }
  }
}
