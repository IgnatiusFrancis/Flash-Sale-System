import { LeaderBoardService } from "../../../data/services/leader-board/leader-board";
import { MissingParamError } from "../../errors";
import { created, handleError, success } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./board.protocols";

export class LeaderBoardController implements Controller {
  private readonly leaderBoardService: LeaderBoardService;

  constructor(leaderBoardService: LeaderBoardService) {
    this.leaderBoardService = leaderBoardService;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = httpRequest.user?.id;
      if (!userId) {
        throw new MissingParamError("userId");
      }

      const flashSaleId = httpRequest.query?.flashSaleId as string;
      if (!flashSaleId) {
        throw new MissingParamError("flashSaleId");
      }

      // Get pagination parameters from query params
      const page = parseInt(httpRequest.query?.page as string) || 1;
      const limit = parseInt(httpRequest.query?.limit as string) || 10;

      const leaderboard = await this.leaderBoardService.getLeaderBoard(
        flashSaleId,
        page,
        limit
      );

      return success(leaderboard);
    } catch (error) {
      return handleError(error);
    }
  }
}
