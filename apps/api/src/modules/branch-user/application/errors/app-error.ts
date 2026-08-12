export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
  }
}
