import { HttpRequest, HttpResponse, Controller } from "./product-protocols";
import { MissingParamError, InvalidParamError } from "../../errors";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { AddProduct } from "../../../domain/usecases/add-product";

export class ProductController implements Controller {
  private readonly addProduct: AddProduct;

  constructor(addProduct: AddProduct) {
    this.addProduct = addProduct;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = ["name", "totalUnits", "saleStartTime"];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field));
        }
      }

      const { name, totalUnits, saleStartTime } = httpRequest.body;

      if (totalUnits < 1) {
        return badRequest(new InvalidParamError("totalUnits"));
      }

      if (new Date(saleStartTime) < new Date()) {
        return badRequest(new InvalidParamError("saleStartTime"));
      }

      const product = await this.addProduct.add({
        name,
        totalUnits,
        //availableUnits: totalUnits,
        saleStartTime,
        //saleEndTime,
      });

      return ok(product);
    } catch (error) {
      return serverError(error);
    }
  }
}
