import {
  BusinessError,
  ForbiddenError,
  NotFoundError,
} from "../../../presentation/errors";
import { PurchaseRepository } from "../../protocols/purchase-repository";
import { FlashSaleStatus } from "../add-flashSale/db-add-flashSale-protocols";

import {
  AddPurchase,
  AddPurchaseModel,
  FlashSaleRepository,
  PurchaseDocument,
} from "./db-add-purchase-protocols";

export class DbPurchaseProduct implements AddPurchase {
  private readonly purchaseRepository: PurchaseRepository;
  private readonly flashSaleRepository: FlashSaleRepository;

  constructor(
    purchaseRepository: PurchaseRepository,
    flashSaleRepository: FlashSaleRepository
  ) {
    this.purchaseRepository = purchaseRepository;
    this.flashSaleRepository = flashSaleRepository;
  }

  async purchaseProduct(
    purchaseData: AddPurchaseModel
  ): Promise<PurchaseDocument> {
    // Find the flash sale
    const flashSale = await this.flashSaleRepository.findFlashSaleById(
      purchaseData.flashSaleId
    );

    if (!flashSale) {
      throw new NotFoundError({
        message: "Flash sale not found",
        resource: "flashSale",
        code: "FLASH_SALE_NOT_FOUND",
      });
    }

    // Check if the flash sale is active
    if (flashSale.status !== FlashSaleStatus.ACTIVE) {
      throw new BusinessError({
        message: "Flash sale is not active",
        code: "FLASH_SALE_NOT_ACTIVE",
        metadata: {
          flashSaleId: purchaseData.flashSaleId,
          status: flashSale.status,
        },
      });
    }

    // Check if the sale has started
    const now = new Date();
    if (flashSale.startTime > now) {
      throw new BusinessError({
        message: "Flash sale has not started yet",
        code: "FLASH_SALE_NOT_STARTED",
        metadata: {
          flashSaleId: purchaseData.flashSaleId,
          startTime: flashSale.startTime,
          currentTime: now,
        },
      });
    }

    // Check if purchase exceeds per-transaction limit
    if (purchaseData.quantity > flashSale.maxPurchasePerTransaction) {
      throw new ForbiddenError({
        message: `Cannot purchase more than ${flashSale.maxPurchasePerTransaction} items per transaction`,
        code: "TRANSACTION_LIMIT_EXCEEDED",
        metadata: {
          requested: purchaseData.quantity,
          limit: flashSale.maxPurchasePerTransaction,
        },
      });
    }

    // Check if user has reached their total purchase limit
    const totalPurchased =
      await this.purchaseRepository.getTotalPurchasesByUser(
        purchaseData.userId,
        purchaseData.flashSaleId
      );

    const remainingAllowance = flashSale.maxPurchasePerUser - totalPurchased;

    if (remainingAllowance <= 0) {
      throw new ForbiddenError({
        message: `You have reached the maximum purchase limit for this sale`,
        code: "USER_PURCHASE_LIMIT_REACHED",
        metadata: {
          limit: flashSale.maxPurchasePerUser,
          purchased: totalPurchased,
        },
      });
    }

    if (purchaseData.quantity > remainingAllowance) {
      throw new ForbiddenError({
        message: `Cannot purchase more than your remaining allowance of ${remainingAllowance} items`,
        code: "REMAINING_ALLOWANCE_EXCEEDED",
        metadata: {
          requested: purchaseData.quantity,
          remainingAllowance,
        },
      });
    }

    // ** Check if sufficient stock is available before decrementing**
    if (flashSale.availableUnits < purchaseData.quantity) {
      throw new BusinessError({
        message: "Not enough stock available for purchase",
        code: "INSUFFICIENT_STOCK",
        metadata: {
          flashSaleId: purchaseData.flashSaleId,
          requestedQuantity: purchaseData.quantity,
          availableStock: flashSale.availableUnits,
        },
      });
    }

    // Create the purchase record
    return await this.purchaseRepository.purchaseProduct(purchaseData);
  }
}
