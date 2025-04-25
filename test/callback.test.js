import request from "supertest";
import app from "../index.js";
import { v4 as uuidv4 } from "uuid";

describe("Callback API", () => {
  it("should handle bet callback", async () => {
    const response = await request(app)
      .post("/callback/bet")
      .send({
        user_id: "user123",
        amount: 10,
        currency: "USD",
        wager_no: `W-${uuidv4()}`,
        metadata: { game_type: "slot", round_id: "round123" },
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("should handle win callback", async () => {
    const response = await request(app)
      .post("/callback/win")
      .send({
        user_id: "user123",
        amount: 50,
        currency: "USD",
        wager_no: `W-${uuidv4()}`,
        metadata: { game_type: "slot", round_id: "round123" },
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("should handle rollback callback", async () => {
    const response = await request(app)
      .post("/callback/rollback")
      .send({
        user_id: "user123",
        wager_no: `W-${uuidv4()}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });
});
