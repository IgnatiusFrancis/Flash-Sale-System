export class ConflictError extends Error {
  constructor() {
    super("Conflict: Resource already exists");
    this.name = "ConflictError";
  }
}
