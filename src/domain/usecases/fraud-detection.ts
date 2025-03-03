import { TransactionDocument } from "../models/transaction";

export interface DetectFraud {
  processTransaction(
    transactionData: Partial<TransactionDocument>
  ): Promise<TransactionDocument>;
}
