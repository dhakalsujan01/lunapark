import { NextRequest } from "next/server"
import connectDB from "./mongodb"
import SecurityLog from "@/models/SecurityLog"

interface RateLimitEntry {
  userId: string
  attempts: number
  lastAttempt: number
  windowStart: number
}

// In-memory cache for rate limiting (with database persistence)
const rateLimitCache = new Map<string, RateLimitEntry>()

// Global default configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 10,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // 5 minutes block
}

// Optional per-action overrides (tune safely without Redis)
const ACTION_LIMITS: Record<string, Partial<typeof RATE_LIMIT_CONFIG>> = {
  // Stricter for auth-like flows
  login: { maxAttempts: 5, windowMs: 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
  password_reset: { maxAttempts: 3, windowMs: 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  // Ticket validation can be a bit higher but still bounded
  ticket_validation: { maxAttempts: 10, windowMs: 60 * 1000, blockDurationMs: 5 * 60 * 1000 },
}

// Cap the cache to prevent unbounded memory growth
const MAX_CACHE_ENTRIES = 50000

function getConfigForAction(action: string) {
  const override = ACTION_LIMITS[action] || {}
  return {
    ...RATE_LIMIT_CONFIG,
    ...override,
  }
}

function makeKey(userId: string | undefined, action: string, ipAddress?: string) {
  const safeUser = userId || "anon"
  const safeIp = ipAddress || "unknown"
  // Compose a composite key to avoid shared-account abuse and distribute limits fairly
  return `${action}:${safeUser}:${safeIp}`
}

export async function checkRateLimit(
  userId: string,
  action: string = "ticket_validation",
  ipAddress?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now()
  const cfg = getConfigForAction(action)
  const key = makeKey(userId, action, ipAddress)
  
  // Get or create rate limit entry
  let entry = rateLimitCache.get(key)
  
  if (!entry || now - entry.windowStart > cfg.windowMs) {
    // Reset window
    entry = {
      userId: userId || "anon",
      attempts: 0,
      lastAttempt: now,
      windowStart: now,
    }
  }
  
  // Check if user is currently blocked
  if (entry.attempts >= cfg.maxAttempts) {
    const timeSinceLastAttempt = now - entry.lastAttempt
    if (timeSinceLastAttempt < cfg.blockDurationMs) {
      // Still blocked
      const remainingBlockTime = cfg.blockDurationMs - timeSinceLastAttempt
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + remainingBlockTime,
      }
    } else {
      // Block expired, reset
      entry.attempts = 0
      entry.windowStart = now
    }
  }
  
  // Increment attempts
  entry.attempts++
  entry.lastAttempt = now
  rateLimitCache.set(key, entry)

  // Ensure cache does not grow unboundedly
  if (rateLimitCache.size > MAX_CACHE_ENTRIES) {
    // Evict the stalest ~1% entries by windowStart
    const toEvict = Math.max(1, Math.floor(MAX_CACHE_ENTRIES * 0.01))
    const entries = Array.from(rateLimitCache.entries())
    entries
      .sort((a, b) => a[1].windowStart - b[1].windowStart)
      .slice(0, toEvict)
      .forEach(([k]) => rateLimitCache.delete(k))
  }
  
  // Log rate limit violations to database (best-effort)
  if (entry.attempts > cfg.maxAttempts) {
    try {
      await connectDB()
      await SecurityLog.create({
        type: "account_locked",
        userId: (userId || "anon") as any,
        ipAddress: ipAddress || "unknown",
        userAgent: "rate-limit-middleware",
        severity: "medium",
        details: {
          reason: `Rate limit exceeded for ${action}`,
          attempts: entry.attempts,
        },
      })
    } catch (error) {
      console.error("Failed to log rate limit violation:", error)
    }
  }
  
  const remaining = Math.max(0, cfg.maxAttempts - entry.attempts)
  const resetTime = entry.windowStart + cfg.windowMs
  
  return {
    allowed: entry.attempts <= cfg.maxAttempts,
    remaining,
    resetTime,
  }
}

export async function getClientIP(request: NextRequest): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip")
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return "unknown"
}

// Cleanup old entries periodically (every 5 minutes)
// Only run cleanup in server environment, not in serverless
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitCache.entries()) {
      if (now - entry.windowStart > RATE_LIMIT_CONFIG.windowMs * 2) {
        rateLimitCache.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}
