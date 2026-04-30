export abstract class BaseError extends Error {
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DatabaseError extends BaseError {
  readonly code = "DATABASE_ERROR";
}

export class RecordNotFoundError extends BaseError {
  readonly code = "NOT_FOUND";
}