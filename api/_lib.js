/**
 * Shared helpers for Vercel serverless api/*.js
 * - clean / getClientIp / checkRateLimit: input validation + durable-ish rate limit
 * - fetchWithTimeout: every outbound fetch gets AbortSignal.timeout
 * - reqId: per-request id for logs (no tokens/secrets)
 */

export function clean(s, max = 200) {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, max);
}

export function getClientIp(req) {
  const headers = req.headers || {};
  const xf = headers['x-forwarded-for'] || headers['x-real-ip'] || headers['x-vercel-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

/** In-memory limiter. On Vercel this resets per cold start — fine for lead spam,
 *  not for abuse. Swap for Upstash/Redis when lead volume justifies it. */
const rateLimitHits = new Map();

export function checkRateLimit(ip, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  let entry = rateLimitHits.get(ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    rateLimitHits.set(ip, entry);
  }
  entry.count += 1;
  return entry.count <= max;
}

/** fetch with a hard timeout. Default 10s. */
export async function fetchWithTimeout(url, init = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Short per-request id for logs — never log tokens or PII. */
export function reqId() {
  return Math.random().toString(36).slice(2, 10);
}
