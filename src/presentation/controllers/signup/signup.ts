//presentation/controllers/signup/signup.ts
import {
  HttpRequest,
  HttpResponse,
  Controller,
  EmailValidator,
  AddUser,
} from "./signup-protocols";
import { MissingParamError, InvalidParamError } from "../../errors";
import { handleError, success } from "../../helpers/http-helpers";

export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator;
  private readonly addUser: AddUser;

  constructor(emailValidator: EmailValidator, addUser: AddUser) {
    this.emailValidator = emailValidator;
    this.addUser = addUser;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = [
        "name",
        "email",
        "password",
        "password_confirmation",
      ];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          throw new MissingParamError(field);
        }
      }

      const {
        name,
        email,
        password,
        role,
        password_confirmation: passwordConfirmation,
      } = httpRequest.body;

      if (password !== passwordConfirmation) {
        throw new InvalidParamError(
          "password_confirmation",
          "Incorrect Password"
        );
      }

      const isValidEmail = this.emailValidator.isValid(email);

      if (!isValidEmail) {
        throw new InvalidParamError("email", "Invalid email format");
      }

      const account = await this.addUser.add({
        name,
        email,
        password,
        role,
      });
      const accountData = account.toObject();
      const { password: _, ...data } = accountData;
      return success(data);
    } catch (error) {
      return handleError(error);
    }
  }
}
