import { test, expect } from "bun:test";
import { ArcClient, ArcApiError } from "../src/index.js";

test("ArcClient constructor", () => {
  const client = new ArcClient({
    apiKey: "test-key",
    baseUrl: "https://test.example.com"
  });
  
  expect(client).toBeInstanceOf(ArcClient);
});

test("ArcClient constructor with default baseUrl", () => {
  const client = new ArcClient({
    apiKey: "test-key"
  });
  
  expect(client).toBeInstanceOf(ArcClient);
});

test("ArcApiError", () => {
  const error = new ArcApiError("Test error", 404, "Not found");
  
  expect(error).toBeInstanceOf(Error);
  expect(error.name).toBe("ArcApiError");
  expect(error.message).toBe("Test error");
  expect(error.status).toBe(404);
  expect(error.response).toBe("Not found");
});

// Mock fetch for API testing
const mockFetch = (response: any, ok = true, status = 200) => {
  (global as any).fetch = async () => ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    json: async () => response,
    text: async () => JSON.stringify(response)
  }) as Response;
};

test("listGames success", async () => {
  const mockGames = [
    { game_id: "ls20-016295f7601e", title: "LS20" },
    { game_id: "ft09-16726c5b26ff", title: "FT09" }
  ];
  
  mockFetch(mockGames);
  
  const client = new ArcClient({ apiKey: "test-key" });
  const games = await client.listGames();
  
  expect(games).toEqual(mockGames);
});

test("openScorecard success", async () => {
  const mockResponse = { card_id: "8bb3b1b8-4b46-4a29-a13b-ad7850a0f916" };
  
  mockFetch(mockResponse);
  
  const client = new ArcClient({ apiKey: "test-key" });
  const result = await client.openScorecard({
    source_url: "https://github.com/example/agent",
    tags: ["test"]
  });
  
  expect(result).toEqual(mockResponse);
});

test("API error handling", async () => {
  mockFetch({ error: "Unauthorized" }, false, 401);
  
  const client = new ArcClient({ apiKey: "invalid-key" });
  
  try {
    await client.listGames();
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(ArcApiError);
    expect((error as ArcApiError).status).toBe(401);
  }
});