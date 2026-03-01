export class BusinessError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "BusinessError";
    this.status = status;
    this.details = details;
  }
}
