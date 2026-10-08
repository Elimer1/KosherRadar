// Small error type so services can say "this is a 404" or "this is a 401".
export class AppError extends Error {
  constructor(message, statusCode = 500, code = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}
