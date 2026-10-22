import crypto from "crypto";
import fs from "fs";
import path from "path";

// Attempt to load .env file if available
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envPath);
  }
} catch {
  // Ignore if already loaded or not accessible
}

/**
 * Validates and retrieves the JWT_SECRET from environment variables.
 * Fails safely by throwing an error if missing or under 32 characters.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "[FATAL SECURITY ERROR] Missing or insecure JWT_SECRET environment variable. " +
      "A cryptographically strong secret of at least 32 characters MUST be configured via process.env.JWT_SECRET."
    );
  }
  return secret.trim();
}

/**
 * Base64URL encoder / decoder for RFC 7519 JWT standard
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Hash password securely with per-user salt using Node's cryptographic scrypt
 */
export function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify candidate password against salted hash using timing-safe comparison
 */
export function verifyPassword(candidatePassword, storedHash) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }
  try {
    const [salt, key] = storedHash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(candidatePassword, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    console.error("[AUTH] Password verification error:", err.message);
    return false;
  }
}

/**
 * Sign a genuine cryptographically verified JWT token using HMAC-SHA256
 */
export function signToken(payload, expiresInSeconds = 3600) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iss: "grandstay-api",
    aud: "grandstay-client",
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const secret = getJwtSecret();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signatureInput);
  const signature = hmac.digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signatureInput}.${signature}`;
}

/**
 * Verify genuine JWT token signature, expiration, and claims
 */
export function verifyToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Missing or invalid token format");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed JWT token: Must contain 3 segments");
  }

  const [encodedHeader, encodedPayload, candidateSignature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Recalculate HMAC signature using secret key
  const secret = getJwtSecret();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signatureInput);
  const expectedSignature = hmac.digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Constant-time signature verification to prevent timing attack
  const candBuf = Buffer.from(candidateSignature);
  const expBuf = Buffer.from(expectedSignature);

  if (candBuf.length !== expBuf.length || !crypto.timingSafeEqual(candBuf, expBuf)) {
    throw new Error("Invalid token signature: Token has been tampered with or forged");
  }

  // Parse payload and check expiration
  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    throw new Error("Token expired: Authentication session has expired");
  }

  return payload;
}
