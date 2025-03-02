import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";
import { LogErrorRepository } from "../../data/protocols/log-error-repository";

export class LogControllerDecorator implements Controller {
  private readonly controller: Controller;
  private readonly logErrorRepository: LogErrorRepository;

  constructor(controller: Controller, logErrorRepository: LogErrorRepository) {
    this.controller = controller;
    this.logErrorRepository = logErrorRepository;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const httpResponse = await this.controller.handle(httpRequest);

    // Check if there was an error
    if (httpResponse.statusCode >= 400) {
      // Log the error but don't modify the response
      await this.logErrorRepository.logError(
        httpResponse.body instanceof Error
          ? httpResponse.body.stack
          : JSON.stringify(httpResponse.body)
      );
    }

    // Always return the original response
    return httpResponse;
  }
}
