// src/index.js
import express, { json } from "express";
import callbackRoutes from "./routes/callback.js";
import launchRoutes from "./routes/launch.js";
import { error, info } from "./utils/logger.js";
import internalRedirect from "./routes/redirect.js";
// import dotenv from "dotenv";
// dotenv.config();
const app = express();
app.use("/", internalRedirect);
app.use("/hello", (req, res) => {
  console.log("✅ /hello route hit!");
  res.json({ message: "Hello World!" });
});
app.use(json({ limit: "600kb" })); // Enforce payload size limit

// Routes
app.use("/callback", callbackRoutes);
app.use("/redirect", launchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  info(`Service running on port ${PORT}`);
});
export default app;
