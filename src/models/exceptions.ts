export class DailySparkException extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "DailySparkException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StorageWriteException extends DailySparkException {
  constructor(key: string, originalError?: any) {
    super(
      `Failed to write key "${key}" to browser local storage.`,
      "STORAGE_WRITE_FAILURE"
    );
    this.name = "StorageWriteException";
  }
}

export class StorageReadException extends DailySparkException {
  constructor(key: string, originalError?: any) {
    super(
      `Failed to read key "${key}" from browser local storage.`,
      "STORAGE_READ_FAILURE"
    );
    this.name = "StorageReadException";
  }
}

export class QuoteNotFoundException extends DailySparkException {
  constructor(quoteId: number) {
    super(
      `Quote with ID ${quoteId} was not found in local JSON repository.`,
      "QUOTE_NOT_FOUND"
    );
    this.name = "QuoteNotFoundException";
  }
}

export class NotificationPermissionDeniedException extends DailySparkException {
  constructor() {
    super(
      "Notification permission has been denied by the user. Enable it in browser settings.",
      "NOTIFICATION_PERMISSION_DENIED"
    );
    this.name = "NotificationPermissionDeniedException";
  }
}
