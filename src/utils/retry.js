// utils/retry.js
import * as rax from "retry-axios";
import axios from "axios";

// Base retry configuration
export const defaultRetryConfig = {
  retry: 3,
  noResponseRetries: 2,
  retryDelay: 1000, // start delay in ms
  backoffType: "exponential",
  httpMethodsToRetry: ["GET", "HEAD", "OPTIONS", "DELETE", "PUT", "POST"],
  statusCodesToRetry: [
    [100, 199],
    [429, 429],
    [500, 599],
  ],
  onRetryAttempt: (err) => {
    const cfg = rax.getConfig(err);
    console.warn(`[RETRY] Attempt #${cfg?.currentRetryAttempt}`);
  },
};

// Helper to attach retry config to an axios instance
export function attachRetry(instance, config = defaultRetryConfig) {
  instance.defaults.raxConfig = {
    ...defaultRetryConfig,
    ...config,
    instance,
  };
  rax.attach(instance);
  return instance;
}

// Optional: create a default retry-enabled axios client
export const retryAxios = attachRetry(axios.create());
