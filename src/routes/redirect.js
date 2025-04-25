// src/routes/internalRedirect.js
import { Router } from "express";
import sessionManager from "../services/sessionManager.js";
import walletClient from "../services/walletClient.js";

const {
  validateMember,
  getMemberBalance,
  cancelWager,
  requestPayment,
  bulkSettleWagers,
} = walletClient;
import { info, error as _error } from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();
const router = Router();
const game_service_key = process.env.GAME_SERVICE_KEY;

router.get("/api/internal/v1/redirect", async (req, res) => {
  const { merchant_id, user_id, currency, user_token } = req.query;
  const authHeader = req.headers["authorization"];
  const trace_id = `${game_service_key}-${user_id}-${Date.now()}`;

  // Validate auth header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      code: 401,
      message: "Missing or invalid AUTHORIZATION header",
    });
  }

  // Validate required query parameters
  const missingParams = [];
  if (!merchant_id) missingParams.push("merchant_id");
  if (!user_id) missingParams.push("user_id");
  if (!currency) missingParams.push("currency");
  if (!user_token) missingParams.push("user_token");

  if (missingParams.length > 0) {
    return res.status(400).json({
      code: 400,
      message: `Missing required parameter(s): ${missingParams.join(", ")}`,
    });
  }

  try {
    info("Handling game redirect", {
      merchant_id,
      user_id,
      currency,
      game_service_key,
      trace_id,
    });
    // Uncomment the following lines to enable session management
    // Validate the user
    // const validation = await validateMember(
    //   user_id,
    //   user_token,
    //   game_service_key
    // );
    // if (!validation?.id) {
    //   throw new Error("User validation failed or user not eligible");
    // }

    // Build the game URL
    const baseGameURL = `https://stg-${game_service_key}.789fin.com`;
    const redirect_url = new URL(baseGameURL);
    redirect_url.searchParams.append("token", user_token);
    redirect_url.searchParams.append("currency", currency);

    // Save session (optional)
    await sessionManager.createSession(user_id, {
      currency,
      redirect_url: redirect_url.toString(),
    });

    // Return final response
    return res.json({
      code: 200,
      data: {
        redirect_url: redirect_url.toString(),
        game_url: baseGameURL,
        token: user_token,
        url_params: {
          token: user_token,
          currency: currency,
        },
      },
      message: "Success",
    });
  } catch (err) {
    _error("Redirect generation failed", {
      trace_id,
      game_service_key,
      error: err.message,
    });
    return res.status(400).json({
      code: 400,
      message: err.message,
    });
  }
});

export default router;
