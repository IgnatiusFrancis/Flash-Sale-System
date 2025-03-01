import {
  AddFlashSale,
  Controller,
  HttpRequest,
  HttpResponse,
} from "./sale-protocols";
import { MissingParamError } from "../../errors";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { FlashSaleStatus } from "../../../domain/models/flashSale";

export class FlashSaleController implements Controller {
  private readonly addFlashSale: AddFlashSale;

  constructor(addFlashSale: AddFlashSale) {
    this.addFlashSale = addFlashSale;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = [
        "productId",
        "availableUnits",
        "startTime",
        "discount",
      ];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field));
        }
      }

      const { productId, availableUnits, startTime, discount, endTime } =
        httpRequest.body;

      if (availableUnits < 1) {
        return badRequest(new Error("availableUnits must be at least 1"));
      }

      const now = new Date();
      if (isNaN(new Date(startTime).getTime())) {
        return badRequest(new Error("Invalid startTime format"));
      }

      if (endTime && isNaN(new Date(endTime).getTime())) {
        return badRequest(new Error("Invalid endTime format"));
      }

      let status: FlashSaleStatus;

      if (startTime > now) {
        status = FlashSaleStatus.PENDING; // Future sale
      } else if (endTime && endTime <= now) {
        status = FlashSaleStatus.ENDED; // Already expired
      } else {
        status = FlashSaleStatus.ACTIVE; // Sale starts immediately
      }

      const flashSale = await this.addFlashSale.add({
        productId,
        discount,
        availableUnits,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        status,
      });

      return ok(flashSale);
    } catch (error) {
      return badRequest(error);
    }
  }
}
