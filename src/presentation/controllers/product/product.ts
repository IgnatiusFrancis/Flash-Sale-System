//presentation/controllers/product/product.ts
import {
  HttpRequest,
  HttpResponse,
  Controller,
  AddProduct,
} from "./product-protocols";
import {
  MissingParamError,
  InvalidParamError,
  ConflictError,
} from "../../errors";
import { handleError, success } from "../../helpers/http-helpers";
//import { badRequest, ok, serverError } from "../../helpers/http-helpers";

export class ProductController implements Controller {
  private readonly addProduct: AddProduct;

  constructor(addProduct: AddProduct) {
    this.addProduct = addProduct;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = ["name", "totalUnits", "price"];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          throw new MissingParamError(field);
          //return badRequest(new MissingParamError(field));
        }
      }

      const { name, totalUnits, price } = httpRequest.body;

      if (totalUnits < 1) {
        // return badRequest(new InvalidParamError("totalUnits"));
        throw new InvalidParamError(
          "totalUnits",
          "Value must be greater than 0"
        );
      }

      if (price <= 0) {
        throw new InvalidParamError("price", "Value must be greater than 0");
      }

      if (typeof name !== "string" || name.trim().length < 3) {
        throw new InvalidParamError(
          "name",
          "Must be at least 3 characters long"
        );
      }

      const product = await this.addProduct.add({
        name,
        totalUnits,
        price,
      });

      // if (!product) {
      //   return badRequest(new Error("Product already exists"));
      // }

      if (!product) {
        throw new ConflictError({
          message: "Product with this name already exists",
          resource: "product",
          metadata: { productName: name },
        });
      }

      // return ok(product);
      return success(product);
    } catch (error) {
      // return serverError(error);
      return handleError(error);
    }
  }
}
