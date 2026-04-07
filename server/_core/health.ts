import { ENV } from "./env";
import { getDb } from "../db";

export async function buildHealthSnapshot() {
  const db = await getDb();
  const databaseConnected = Boolean(db);
  const twilioConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER,
  );

  const checks = {
    database: databaseConnected ? "up" : "down",
    oauth: ENV.oAuthServerUrl ? "configured" : "missing",
    owner: ENV.ownerOpenId ? "configured" : "missing",
    forge: ENV.forgeApiUrl && ENV.forgeApiKey ? "configured" : "missing",
    notifications: twilioConfigured ? "configured" : "missing",
    cors: ENV.corsAllowedOrigins || ENV.corsAllowAllInDev ? "configured" : "missing",
  } as const;

  const warnings = Object.entries(checks)
    .filter(([, value]) => value !== "up" && value !== "configured")
    .map(([key]) => key);

  return {
    ok: databaseConnected,
    timestamp: Date.now(),
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      isProduction: ENV.isProduction,
    },
    checks,
    warnings,
  };
}
