import { describe, it, expect } from "vitest";
import { quoteService } from "../services/quoteService";

describe("quoteService", () => {
  it("should load all 200 quotes from database", () => {
    const list = quoteService.getAllQuotes();
    expect(list.length).toBeGreaterThanOrEqual(200);
  });

  it("should fetch quotes by category", () => {
    const motivationQuotes = quoteService.getQuotesByCategory("Motivation");
    expect(motivationQuotes.length).toBeGreaterThan(0);
    motivationQuotes.forEach((q) => {
      expect(q.category).toBe("Motivation");
    });
  });

  it("should filter quotes by query matching quote text or author", () => {
    const match = quoteService.searchQuotes("Jobs");
    expect(match.length).toBeGreaterThan(0);
    match.forEach((q) => {
      const matchText = q.quote.toLowerCase().includes("jobs") || q.author.toLowerCase().includes("jobs");
      expect(matchText).toBe(true);
    });
  });

  it("should fetch a valid Quote of the Day", () => {
    const qotd = quoteService.getQuoteOfDay();
    expect(qotd).toBeDefined();
    expect(qotd.quote).toBeTypeOf("string");
    expect(qotd.author).toBeTypeOf("string");
  });

  it("should return a random quote when shuffled", () => {
    const random = quoteService.getRandomQuote();
    expect(random).toBeDefined();
    expect(random.id).toBeGreaterThan(0);
  });
});
