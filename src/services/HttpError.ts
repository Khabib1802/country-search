export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message = `HTTP error! Status: ${status}`) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
