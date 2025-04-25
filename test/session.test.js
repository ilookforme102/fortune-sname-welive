import request from "supertest";
import app from "../index.js";

describe("Session API", () => {
  it("should generate redirect URL", async () => {
    const response = await request(app).get("/redirect").query({
      user_id: "user123",
      user_token: "token123",
      language: "en",
      currency: "USD",
      game_service_key: "ggl",
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("redirect_url");
    expect(response.body.data).toHaveProperty("balance", 1000);
  });
});
