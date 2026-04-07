import type { NextFunction, Request, Response } from "express";
import { ENV } from "./env";

const DEV_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
];

const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Origin, X-Requested-With, Content-Type, Accept, Authorization";
const DEFAULT_MAX_AGE = "86400";

function normalizeOrigin(origin: string): string {
  try {
    return new URL(origin).origin;
  } catch {
    return origin.trim();
  }
}

function parseConfiguredOrigins() {
  return ENV.corsAllowedOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeOrigin);
}

function getAllowedOrigins() {
  const configured = parseConfiguredOrigins();
  if (ENV.isProduction) return configured;
  if (ENV.corsAllowAllInDev) {
    return Array.from(new Set([...configured, ...DEV_ALLOWED_ORIGINS]));
  }
  return configured;
}

function isOriginAllowed(origin?: string | null) {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(normalizedOrigin);
}

function applyCorsHeaders(res: Response, origin: string) {
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Origin", normalizeOrigin(origin));
  res.header("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.header("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", DEFAULT_MAX_AGE);
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  if (!origin) {
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
    return;
  }

  if (!isOriginAllowed(origin)) {
    res.header("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.status(403).send("CORS origin denied");
      return;
    }
    res.status(403).json({ error: "CORS origin denied" });
    return;
  }

  applyCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
