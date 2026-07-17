export class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public debug(message: string, ...optionalParams: any[]): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] [DailySpark] ${message}`, ...optionalParams);
    }
  }

  public info(message: string, ...optionalParams: any[]): void {
    console.info(`[INFO] [DailySpark] ${message}`, ...optionalParams);
  }

  public warn(message: string, ...optionalParams: any[]): void {
    console.warn(`[WARN] [DailySpark] ${message}`, ...optionalParams);
  }

  public error(message: string, error?: any): void {
    console.error(`[ERROR] [DailySpark] ${message}`, error || "");
  }
}

export const logger = LoggerService.getInstance();
