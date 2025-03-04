export interface leaderboard {
  getLeaderBoard(
    flashSaleId: string,
    page: number,
    limit: number
  ): Promise<any>;
}
