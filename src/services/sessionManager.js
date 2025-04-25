// src/service/sessionManager.js
import { v4 as uuidv4 } from "uuid";
import { info, error } from "../utils/logger.js";

// Mock session store (replace with Redis or DB in production)
const sessions = new Map();

async function createSession(user_id, options) {
  const token = uuidv4();
  const session = {
    user_id,
    token,
    currency: options.currency,
    language: options.language,
    created_at: new Date(),
  };

  sessions.set(token, session);
  info("Session created", { user_id, token });

  return session;
}

async function getSession(token) {
  const session = sessions.get(token);
  if (!session) {
    error("Session not found", { token });
    throw new Error("Invalid session");
  }
  return session;
}

export default {
  createSession,
  getSession,
};
