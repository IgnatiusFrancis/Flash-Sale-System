//presentation/controllers/product/product.ts
import {
  HttpRequest,
  HttpResponse,
  Controller,
  AddProduct,
} from "./product-protocols";
import { MissingParamError, InvalidParamError } from "../../errors";
import { created, handleError } from "../../helpers/http-helpers";

export class ProductController implements Controller {
  private readonly addProduct: AddProduct;

  constructor(addProduct: AddProduct) {
    this.addProduct = addProduct;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const user = httpRequest.user?.id;
      if (!user) {
        throw new MissingParamError("userId");
      }

      const requiredFields = ["name", "price"];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          throw new MissingParamError(field);
        }
      }

      const { name, description, price } = httpRequest.body;

      // if (totalUnits < 1) {
      //   // return badRequest(new InvalidParamError("totalUnits"));
      //   throw new InvalidParamError(
      //     "totalUnits",
      //     "Value must be greater than 0"
      //   );
      // }

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
        user,
        name,
        description,
        price,
      });

      return created(product);
    } catch (error) {
      return handleError(error);
    }
  }
}
