//presentation/controllers/login/login.ts
import {
  Authentication,
  EmailValidator,
  HttpRequest,
  HttpResponse,
} from "./login-protocols";
import { InvalidParamError, MissingParamError } from "../../errors";
import { Controller } from "../../protocols/controller";
import { handleError, success } from "../../helpers/http-helpers";

export class LogginContfroller implements Controller {
  private readonly emailValidator: EmailValidator;
  private readonly authentication: Authentication;

  constructor(emailValidator: EmailValidator, authentication: Authentication) {
    this.emailValidator = emailValidator;
    this.authentication = authentication;
  }

  public async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password } = httpRequest.body;

      const requiredFields = ["email", "password"];
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          throw new MissingParamError(field);
        }
      }

      // Validate email format
      const isValid = this.emailValidator.isValid(email);
      if (!isValid) {
        throw new InvalidParamError("email", "Invalid email format");
      }

      // Authenticate user
      const user = await this.authentication.auth(email, password);

      // Extract user details
      const { id, name, role } = user;

      return success({
        user: {
          id,
          name,
          email,
          role,
        },
        accessToken: user.accessToken,
      });
    } catch (error) {
      return handleError(error);
    }
  }
}
