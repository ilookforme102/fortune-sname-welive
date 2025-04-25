// src/services/walletClient.js
import axios from "axios";
import { attachRetry } from "../utils/retry.js";
import { error as _error } from "../utils/logger.js";

const API_SYS_BASE_URL = process.env.API_SYS_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_SYS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.API_SYS_TOKEN}`,
  },
});

// Attach retry logic
attachRetry(axiosInstance);

// Get merchant ID
async function getMerchantId(user_id) {
  try {
    const response = await axiosInstance.get(
      `/api/internal/v1/usr/users/${user_id}`
    );
    return response.data.data?.merchant?.id || null;
  } catch (error) {
    _error("Get merchant ID failed", { error: error.message, user_id });
    throw error;
  }
}

// Validate member
async function validateMember(
  user_id,
  user_token,
  game_key = process.env.GAME_SERVICE_KEY
) {
  try {
    const response = await axiosInstance.get(
      "/api/internal/v1/usr/users/verify",
      {
        params: { user_id, user_token, game_key },
      }
    );
    return response.data.data;
  } catch (error) {
    _error("Validate member failed", { error: error.message });
    throw error;
  }
}

// Get balance
async function getMemberBalance(user_id, currency) {
  try {
    const response = await axiosInstance.get(
      "/api/internal/v1/usr/wallet/balance",
      {
        params: { user_id, currency },
      }
    );
    return response.data.data;
  } catch (error) {
    _error("Get balance failed", { error: error.message });
    throw error;
  }
}

// Debit user
async function requestPayment({
  user_id,
  amount,
  currency,
  parent_wager_no,
  wager_no,
  metadata,
}) {
  try {
    const response = await axiosInstance.post(
      "/api/internal/v1/payment/request",
      {
        user_id,
        amount,
        currency,
        parent_wager_no,
        wager_no,
        metadata,
      }
    );

    const data = response.data.data;
    if (data?.status === 2) {
      throw new Error(
        `Payment failed (fail_reason: ${data?.fail_reason || "unknown"})`
      );
    }

    return data;
  } catch (error) {
    _error("Request payment failed", { error: error.message });
    throw error;
  }
}

// Cancel wager (rollback)
async function cancelWager({
  wager_no,
  game_key = process.env.GAME_SERVICE_KEY,
  metadata = {},
}) {
  try {
    const response = await axiosInstance.post("/api/internal/v1/wager/cancel", {
      game_key,
      wager_no,
      metadata: JSON.stringify(metadata),
    });
    return response.data.data;
  } catch (error) {
    _error("Cancel wager failed", { error: error.message });
    throw error;
  }
}

// Bulk settle win
async function bulkSettleWagers(wagers) {
  try {
    const formatted = wagers.map((w) => ({
      ...w,
      metadata: JSON.stringify(w.metadata || {}),
    }));

    const response = await axiosInstance.post(
      "/api/internal/v1/wager/bulkSettle",
      formatted
    );
    return response.data.data;
  } catch (error) {
    _error("Bulk settle wagers failed", { error: error.message });
    throw error;
  }
}

// Default export object
export default {
  validateMember,
  getMemberBalance,
  requestPayment,
  cancelWager,
  bulkSettleWagers,
  getMerchantId,
};
