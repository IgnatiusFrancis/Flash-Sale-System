import {
  HttpRequest,
  HttpResponse,
  Controller,
  AddProduct,
} from "./product-protocols";
import { MissingParamError, InvalidParamError } from "../../errors";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";

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
          return badRequest(new MissingParamError(field));
        }
      }

      const { name, totalUnits, price } = httpRequest.body;

      if (totalUnits < 1) {
        return badRequest(new InvalidParamError("totalUnits"));
      }

      const product = await this.addProduct.add({
        name,
        totalUnits,
        price,
      });

      if (!product) {
        return badRequest(new Error("Product already exists"));
      }

      return ok(product);
    } catch (error) {
      return serverError(error);
    }
  }
}
