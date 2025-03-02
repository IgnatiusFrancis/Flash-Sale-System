// import {
//   AddFlashSale,
//   Controller,
//   HttpRequest,
//   HttpResponse,
// } from "./sale-protocols";
// import { InvalidParamError, MissingParamError } from "../../errors";
// import { FlashSaleStatus } from "../../../domain/models/flashSale";

// export class FlashSaleController implements Controller {
//   private readonly addFlashSale: AddFlashSale;

//   constructor(addFlashSale: AddFlashSale) {
//     this.addFlashSale = addFlashSale;
//   }

//   async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
//     try {
//       const requiredFields = [
//         "productId",
//         "availableUnits",
//         "startTime",
//         "discount",
//       ];

//       for (const field of requiredFields) {
//         if (!httpRequest.body[field]) {
//           throw new MissingParamError(field);
//           // return badRequest(new MissingParamError(field));
//         }
//       }

//       const { productId, availableUnits, startTime, discount, endTime } =
//         httpRequest.body;

//       if (availableUnits < 1) {
//         throw new InvalidParamError(
//                   "availableUnits",
//                   "Value must be at least 1"
//                 );

//       }

//       const now = new Date();
//       if (isNaN(new Date(startTime).getTime())) {

//         return badRequest(new Error("Invalid startTime format"));
//       }

//       if (endTime && isNaN(new Date(endTime).getTime())) {
//         return badRequest(new Error("Invalid endTime format"));
//       }

//       let status: FlashSaleStatus;

//       if (startTime > now) {
//         status = FlashSaleStatus.PENDING; // Future sale
//       } else if (endTime && endTime <= now) {
//         status = FlashSaleStatus.ENDED; // Already expired
//       } else {
//         status = FlashSaleStatus.ACTIVE; // Sale starts immediately
//       }

//       const flashSale = await this.addFlashSale.add({
//         productId,
//         discount,
//         availableUnits,
//         startTime: new Date(startTime),
//         endTime: endTime ? new Date(endTime) : null,
//         status,
//       });

//       return ok(flashSale);
//     } catch (error) {
//       return badRequest(error);
//     }
//   }
// }

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
import { success, handleError } from "../../helpers/http-helpers";

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
          throw new MissingParamError(field);
        }
      }

      const { productId, availableUnits, startTime, discount, endTime } =
        httpRequest.body;

      // Validate availableUnits
      if (availableUnits < 1) {
        throw new InvalidParamError(
          "availableUnits",
          "Value must be at least 1"
        );
      }

      // Validate discount
      if (discount <= 0 || discount >= 100) {
        throw new InvalidParamError(
          "discount",
          "Must be greater than 0 and less than 100"
        );
      }

      // Validate startTime
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        throw new ValidationError({
          message: "Invalid date format for startTime",
          code: "INVALID_DATE_FORMAT",
          target: "startTime",
        });
      }

      // Validate endTime if provided
      let endDate: Date | null = null;
      if (endTime) {
        endDate = new Date(endTime);
        if (isNaN(endDate.getTime())) {
          throw new ValidationError({
            message: "Invalid date format for endTime",
            code: "INVALID_DATE_FORMAT",
            target: "endTime",
          });
        }

        // Ensure endTime is after startTime
        if (endDate <= startDate) {
          throw new BusinessError({
            message: "End time must be after start time",
            code: "INVALID_TIME_RANGE",
            target: "endTime",
          });
        }
      }

      // Determine sale status based on dates
      const now = new Date();
      let status: FlashSaleStatus;

      if (startDate > now) {
        status = FlashSaleStatus.PENDING; // Future sale
      } else if (endDate && endDate <= now) {
        status = FlashSaleStatus.ENDED; // Already expired
      } else {
        status = FlashSaleStatus.ACTIVE; // Sale starts immediately
      }

      // Validate that the product exists (optional, depends on your needs)
      // This would need a productRepository to be injected
      // if (!await this.productRepository.exists(productId)) {
      //   throw new NotFoundError({
      //     message: 'Product not found',
      //     resource: 'product',
      //     metadata: { productId }
      //   });
      // }

      const flashSale = await this.addFlashSale.add({
        productId,
        discount,
        availableUnits,
        startTime: startDate,
        endTime: endDate,
        status,
      });

      return success(flashSale);
    } catch (error) {
      return handleError(error);
    }
  }
}
