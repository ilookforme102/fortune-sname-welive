// test/routes/redirect.test.js
import request from "supertest";
import app from "../../src/index.js";

// Mock the walletClient module
jest.mock("../../src/services/walletClient.js", () => ({
  default: {
    validateMember: jest.fn().mockResolvedValue({
      id: 123,
      is_valid: true,
      merchant: { id: 1 },
    }),
    getMemberBalance: jest.fn(),
  },
}));

import walletClient from "../../src/services/walletClient.js";

describe("GET /api/internal/v1/redirect", () => {
  const basePath = "/api/internal/v1/redirect";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if Authorization header is missing", async () => {
    const res = await request(app).get(basePath);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/authorization/i);
  });

  it("should return 400 if required query params are missing", async () => {
    const res = await request(app)
      .get(basePath)
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing required parameter/);
  });

  it("should return 200 and a valid redirect_url if all params and auth are provided", async () => {
    const query = {
      merchant_id: 1,
      user_id: 123,
      currency: "USDT",
      user_token: "valid-token",
    };

    const res = await request(app)
      .get(basePath)
      .query(query)
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data.redirect_url).toContain("token=valid-token");
    expect(res.body.data.url_params.currency).toBe("USDT");

    expect(walletClient.default.validateMember).toHaveBeenCalledWith(
      "123",
      "valid-token",
      process.env.GAME_SERVICE_KEY
    );
  });

  it("should return 400 if validateMember fails", async () => {
    walletClient.default.validateMember.mockResolvedValueOnce(null);

    const res = await request(app)
      .get(basePath)
      .query({
        merchant_id: 1,
        user_id: 123,
        currency: "USDT",
        user_token: "invalid-token",
      })
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/validation failed/i);
  });
});
