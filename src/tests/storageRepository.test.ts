import { describe, it, expect, beforeEach, vi } from "vitest";
import { StorageRepository } from "../repositories/storageRepository";
import { StorageReadException, StorageWriteException } from "../models/exceptions";

describe("StorageRepository", () => {
  let repository: StorageRepository;
  const mockStore: Record<string, string> = {};

  beforeEach(() => {
    // Clear mock store
    for (const key in mockStore) {
      delete mockStore[key];
    }
    
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => mockStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStore[key];
      }),
    };

    // Stub window and localStorage globally
    vi.stubGlobal("window", {
      localStorage: mockLocalStorage,
    });
    vi.stubGlobal("localStorage", mockLocalStorage);

    repository = new StorageRepository();
  });

  it("should write and read items correctly", () => {
    repository.setItem("test-key", { val: "hello" });
    const result = repository.getItem("test-key", { val: "default" });
    expect(result).toEqual({ val: "hello" });
  });

  it("should return default value if key is not found", () => {
    const result = repository.getItem("missing-key", "default-val");
    expect(result).toBe("default-val");
  });

  it("should remove items successfully", () => {
    repository.setItem("key-to-delete", "some-data");
    expect(repository.hasItem("key-to-delete")).toBe(true);

    repository.removeItem("key-to-delete");
    expect(repository.hasItem("key-to-delete")).toBe(false);
  });

  it("should throw StorageReadException on corrupt JSON content", () => {
    localStorage.setItem("corrupt-key", "{bad-json");
    expect(() => {
      repository.getItem("corrupt-key", {});
    }).toThrow(StorageReadException);
  });
});
