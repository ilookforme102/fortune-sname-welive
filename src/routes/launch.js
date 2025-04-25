import { Router } from "express";
import axios from "axios"; // ✅ Correct way to use axios in ES module
import sessionManager from "../services/sessionManager.js";
import { info, error as _error } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import walletClient from "../services/walletClient.js";

const {
  validateMember,
  getMemberBalance,
  cancelWager,
  requestPayment,
  bulkSettleWagers,
} = walletClient;
const router = Router();

router.get("/", async (req, res) => {
  const { user_id, user_token, currency, language = "en-US" } = req.query;

  const trace_id = uuidv4();
  const game_service_key = process.env.GAME_SERVICE_KEY;
  const internalRedirectURL = `${process.env.GAME_URL}/api/internal/v1/redirect`;

  try {
    info("Processing /redirect (via launch)", {
      user_id,
      game_service_key,
      trace_id,
    });

    // Validate member
    const validation = await validateMember(
      user_id,
      user_token,
      game_service_key
    );
    if (!validation?.id) {
      throw new Error("Invalid or banned member");
    }

    // Get balance
    const balance = await getMemberBalance(user_id, currency);

    // Call your internal redirect endpoint
    const redirectResponse = await axios.get(internalRedirectURL, {
      headers: {
        Authorization: `Bearer ${process.env.API_SYS_TOKEN}`,
        Accept: "application/json",
      },
      params: {
        merchant_id: validation?.merchant?.id,
        user_id,
        currency,
        user_token,
      },
    });

    if (redirectResponse.status !== 200) {
      throw new Error(
        `Redirect service returned status ${redirectResponse.status}`
      );
    }

    const redirectData = redirectResponse.data.data;

    // Create session (optional)
    await sessionManager.createSession(user_id, {
      currency,
      language,
      redirect_url: redirectData.redirect_url,
    });

    res.json({
      status: "success",
      data: {
        redirect_url: redirectData.redirect_url,
        balance: balance.amount,
        game_url: redirectData.game_url,
        token: redirectData.token,
        url_params: redirectData.url_params,
      },
    });
  } catch (error) {
    _error("Launch redirect failed", {
      error: error.message,
      trace_id,
    });
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
