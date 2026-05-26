import request from "supertest";
import app from "../../src/app.js";
import { describe, it, expect, beforeAll, afterEach } from 'vitest';

describe("GET /health", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
    });
  });
});