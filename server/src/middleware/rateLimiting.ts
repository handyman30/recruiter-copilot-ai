import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface RateLimitInfo {
  sessionCount: number;
  lastAnalysis: number;
  cooldownUntil?: number;
}

// In-memory storage for demo rate limiting
const demoSessionStore = new Map<string, RateLimitInfo>();
const demoIpStore = new Map<string, number>();

// Demo rate limits
const DEMO_SESSION_LIMIT = 2;
const DEMO_IP_DAILY_LIMIT = 5;
const ANALYSIS_COOLDOWN_MS = 30000; // 30 seconds between analyses

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Clean expired entries
  for (const [key, value] of demoSessionStore.entries()) {
    if (value.lastAnalysis < oneDayAgo) {
      demoSessionStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

export const demoRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-session-id'] as string;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!sessionId && !req.userId) {
    return res.status(400).json({ 
      error: 'Session ID required for demo usage',
      code: 'SESSION_REQUIRED'
    });
  }

  try {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Keys for tracking
    const sessionKey = `${sessionId}`;
    const ipKey = `${clientIP}:${today}`;
    
    // Get current usage stats
    const sessionInfo: RateLimitInfo = demoSessionStore.get(sessionKey) || {
      sessionCount: 0,
      lastAnalysis: 0
    };
    
    const currentIpCount = demoIpStore.get(ipKey) || 0;
    
    // Check cooldown period
    if (sessionInfo.cooldownUntil && now < sessionInfo.cooldownUntil) {
      const waitTime = Math.ceil((sessionInfo.cooldownUntil - now) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitTime} seconds before next analysis`,
        code: 'COOLDOWN_ACTIVE',
        waitTime,
        message: 'To avoid delays, sign up for unlimited analyses!'
      });
    }
    
    // Check session limit
    if (sessionInfo.sessionCount >= DEMO_SESSION_LIMIT) {
      return res.status(429).json({
        error: 'Demo session limit reached. Sign up for unlimited analyses!',
        code: 'SESSION_LIMIT_EXCEEDED',
        limit: DEMO_SESSION_LIMIT,
        message: 'Create an account to continue analyzing candidates.'
      });
    }
    
    // Check IP daily limit
    if (currentIpCount >= DEMO_IP_DAILY_LIMIT) {
      return res.status(429).json({
        error: 'Daily demo limit reached for this location. Sign up for unlimited access!',
        code: 'IP_LIMIT_EXCEEDED',
        limit: DEMO_IP_DAILY_LIMIT,
        message: 'Multiple demo sessions detected. Create an account to continue.'
      });
    }
    
    // Check analysis frequency cooldown
    const timeSinceLastAnalysis = now - sessionInfo.lastAnalysis;
    if (sessionInfo.lastAnalysis > 0 && timeSinceLastAnalysis < ANALYSIS_COOLDOWN_MS) {
      const waitTime = Math.ceil((ANALYSIS_COOLDOWN_MS - timeSinceLastAnalysis) / 1000);
      
      // Set cooldown
      sessionInfo.cooldownUntil = now + (ANALYSIS_COOLDOWN_MS - timeSinceLastAnalysis);
      demoSessionStore.set(sessionKey, sessionInfo);
      
      return res.status(429).json({
        error: `Please wait ${waitTime} seconds between analyses`,
        code: 'COOLDOWN_ACTIVE',
        waitTime,
        message: 'Sign up for instant analyses without delays!'
      });
    }
    
    // Update counters
    sessionInfo.sessionCount += 1;
    sessionInfo.lastAnalysis = now;
    sessionInfo.cooldownUntil = undefined;
    
    // Store updated info
    demoSessionStore.set(sessionKey, sessionInfo);
    demoIpStore.set(ipKey, currentIpCount + 1);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Session-Limit': DEMO_SESSION_LIMIT.toString(),
      'X-RateLimit-Session-Remaining': (DEMO_SESSION_LIMIT - sessionInfo.sessionCount).toString(),
      'X-RateLimit-IP-Limit': DEMO_IP_DAILY_LIMIT.toString(),
      'X-RateLimit-IP-Remaining': (DEMO_IP_DAILY_LIMIT - currentIpCount - 1).toString(),
    });
    
    next();
  } catch (error) {
    console.error('Demo rate limiting error:', error);
    // Fail open - don't block users if there's an error
    next();
  }
}; 