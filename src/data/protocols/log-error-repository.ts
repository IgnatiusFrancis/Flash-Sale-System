//data/protocols/log-error-repository.ts
export interface LogErrorRepository {
  logError(stack: string): Promise<void>;
}
