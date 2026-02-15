export class BusinessError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BusinessError";
    this.status = status;
  }
}

