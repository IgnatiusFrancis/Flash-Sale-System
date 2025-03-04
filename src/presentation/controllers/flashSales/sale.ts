//controller/flashSales/sale.ts
import { DateTime } from "luxon";
import {
  AddFlashSale,
  Controller,
  HttpRequest,
  HttpResponse,
} from "./sale-protocols";
import {
  InvalidParamError,
  MissingParamError,
  ValidationError,
  BusinessError,
  NotFoundError,
} from "../../errors";
import { FlashSaleStatus } from "../../../domain/models/flashSale";
import { handleError, created } from "../../helpers/http-helpers";

export class FlashSaleController implements Controller {
  private readonly addFlashSale: AddFlashSale;

  constructor(addFlashSale: AddFlashSale) {
    this.addFlashSale = addFlashSale;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = ["productId", "startTime", "discount"];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          throw new MissingParamError(field);
        }
      }

      const { productId, startTime, discount } = httpRequest.body;

      // Validate discount
      if (discount <= 0 || discount >= 100) {
        throw new InvalidParamError(
          "discount",
          "Must be greater than 0 and less than 100"
        );
      }

      // Convert startTime to UTC
      const startDate = DateTime.fromISO(startTime, { zone: "America/Chicago" })
        .toUTC()
        .toJSDate();
      const nowUtc = new Date();

      console.log("nowUtc:", nowUtc, "startUtc:", startDate);

      // Ensure startTime is a valid date
      if (isNaN(startDate.getTime())) {
        throw new ValidationError({
          message: "Invalid date format for startTime",
          code: "INVALID_DATE_FORMAT",
          target: "startTime",
        });
      }

      // Ensure startTime is not in the past
      if (startDate < nowUtc) {
        throw new ValidationError({
          message: "startTime cannot be in the past",
          code: "START_TIME_IN_PAST",
          target: "startTime",
        });
      }

      // Determine sale status based on dates
      let status: FlashSaleStatus = FlashSaleStatus.PENDING;

      const flashSale = await this.addFlashSale.add({
        productId,
        discount,
        status,
        startTime: startDate, // Store in UTC
      });

      return created(flashSale);
    } catch (error) {
      return handleError(error);
    }
  }
}
