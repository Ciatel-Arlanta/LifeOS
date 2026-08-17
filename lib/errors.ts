/** Shared error shape. Screens should show `message`; logs may include `code` and `cause`. */
export class AppError extends Error {
  readonly code: string;
  override readonly cause?: unknown;

  constructor(message: string, code = 'unknown', cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export function toUserMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
