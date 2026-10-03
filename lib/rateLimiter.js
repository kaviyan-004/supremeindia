/**
 * Sliding Window In-Memory Rate Limiter for Authentication & Sensitive Endpoints
 * Prevents Brute-Force, Credential Stuffing, and Account Takeover Attacks
 */

// Key format: Map<string, number[]> where numbers are timestamps (ms)
const rateLimitStore = new Map();

// Automatic cleanup every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const valid = timestamps.filter((t) => now - t < 3600000); // 1 hour max
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, valid);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extract Client IP from Request
 */
export function getClientIp(req) {
  if (!req) return '127.0.0.1';
  const forwarded = req.headers?.get?.('x-forwarded-for') || req.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers?.get?.('x-real-ip') || req.headers?.['x-real-ip'];
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

/**
 * Generic Rate Limit Checker
 * @param {string} key Identifier (e.g. `login:127.0.0.1:user@example.com`)
 * @param {number} limit Maximum allowed attempts within window
 * @param {number} windowMs Window duration in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetInSeconds: number }}
 */
export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];
  
  // Filter out timestamps older than the window
  const recent = timestamps.filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  recent.push(now);
  rateLimitStore.set(key, recent);

  return {
    allowed: true,
    remaining: limit - recent.length,
    resetInSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Clear limit upon successful authentication
 */
export function clearRateLimit(key) {
  rateLimitStore.delete(key);
}

/**
 * Login Rate Limiting: Max 5 failed attempts per 15 minutes per IP + Email
 */
export function checkLoginLimit(ip, email) {
  const key = `login:${ip}:${(email || '').toLowerCase().trim()}`;
  return checkRateLimit(key, 5, 15 * 60 * 1000);
}

export function clearLoginLimit(ip, email) {
  const key = `login:${ip}:${(email || '').toLowerCase().trim()}`;
  clearRateLimit(key);
}

/**
 * Registration Rate Limiting: Max 3 accounts per IP per hour
 */
export function checkRegisterLimit(ip) {
  const key = `register:${ip}`;
  return checkRateLimit(key, 5, 60 * 60 * 1000);
}

/**
 * Password Reset Rate Limiting: Max 3 requests per IP + Email per 30 minutes
 */
export function checkForgotPasswordLimit(ip, email) {
  const key = `forgot:${ip}:${(email || '').toLowerCase().trim()}`;
  return checkRateLimit(key, 3, 30 * 60 * 1000);
}
