import { onRequest } from "firebase-functions/v2/https";
import app from "./server.js";

/**
 * Kone AI Orchestrator Cloud Function (2nd Gen)
 * Provides serverless HTTPS endpoint for student trajectory synthesis,
 * telemetry, and generic chatbot conversational routing.
 */
export const api = onRequest({
  cors: true,
  region: "us-central1",
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: "256MiB"
}, app);
