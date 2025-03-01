import {
  AddFlashSale,
  Controller,
  HttpRequest,
  HttpResponse,
} from "./sale-protocols";
import { MissingParamError } from "../../errors";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";

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

      const flashSale = await this.addFlashSale.add({
        productId,
        discount,
        availableUnits,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });

      return ok(flashSale);
    } catch (error) {
      return serverError(error);
    }
  }
}
