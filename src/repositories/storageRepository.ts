import { StorageReadException, StorageWriteException } from "../models/exceptions";
import { logger } from "../services/loggerService";

export interface IStorageRepository {
  getItem<T>(key: string, defaultValue: T): T;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  hasItem(key: string): boolean;
}

export class StorageRepository implements IStorageRepository {
  private isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.localStorage;
  }

  public getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      return defaultValue;
    }

    try {
      const data = localStorage.getItem(key);
      if (data === null) {
        return defaultValue;
      }
      return JSON.parse(data) as T;
    } catch (err) {
      logger.error(`Error reading key "${key}" from localStorage`, err);
      throw new StorageReadException(key, err);
    }
  }

  public setItem<T>(key: string, value: T): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      logger.debug(`Saved item to storage: ${key}`);
    } catch (err) {
      logger.error(`Error writing key "${key}" to localStorage`, err);
      throw new StorageWriteException(key, err);
    }
  }

  public removeItem(key: string): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(key);
      logger.debug(`Removed item from storage: ${key}`);
    } catch (err) {
      logger.error(`Error removing key "${key}" from localStorage`, err);
      throw new StorageWriteException(key, err);
    }
  }

  public hasItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return localStorage.getItem(key) !== null;
    } catch (err) {
      return false;
    }
  }
}

export const storageRepository = new StorageRepository();
