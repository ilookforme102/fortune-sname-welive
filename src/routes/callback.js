// src/routes/callback.js
import { Router } from "express";
const router = Router();
import walletClient from "../services/walletClient.js";

const { validateMember, requestPayment, bulkSettleWagers, cancelWager } =
  walletClient;

import { info, error as _error } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

// POST /callback/bet
router.post("/bet", async (req, res) => {
  const { user_id, amount, currency, wager_no, metadata, user_token } =
    req.body;
  const parent_wager_no = `PW-${uuidv4()}`; // Generate parent wager no
  const trace_id = uuidv4();
  try {
    info("Processing bet callback", { user_id, wager_no, trace_id });

    // Validate member
    const validation = await validateMember(user_id, user_token);
    if (!validation.is_valid) {
      throw new Error("Invalid or banned member");
    }

    // Request payment (debit)
    const paymentResponse = await requestPayment({
      user_id,
      amount,
      currency,
      parent_wager_no,
      wager_no,
      metadata: { ...metadata, game_type: "slot", trace_id },
    });

    res.json({
      status: "success",
      data: paymentResponse,
    });
  } catch (error) {
    _error("Bet callback failed", { error: error.message, trace_id });
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

// POST /callback/win
router.post("/win", async (req, res) => {
  const { user_id, amount, currency, wager_no, metadata } = req.body;
  const trace_id = uuidv4();

  try {
    info("Processing win callback", { user_id, wager_no, trace_id });

    // Settle wager (credit)
    const settleResponse = await bulkSettleWagers([
      {
        user_id,
        amount,
        currency,
        wager_no,
        metadata: { ...metadata, game_type: "slot", trace_id },
      },
    ]);

    res.json({
      status: "success",
      data: settleResponse,
    });
  } catch (error) {
    _error("Win callback failed", { error: error.message, trace_id });
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

// POST /callback/rollback
router.post("/rollback", async (req, res) => {
  const { user_id, wager_no } = req.body;
  const trace_id = uuidv4();

  try {
    info("Processing rollback callback", { user_id, wager_no, trace_id });

    // Cancel wager
    const cancelResponse = await cancelWager({ user_id, wager_no });

    res.json({
      status: "success",
      data: cancelResponse,
    });
  } catch (error) {
    _error("Rollback callback failed", { error: error.message, trace_id });
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
