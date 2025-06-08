// Session management for demo users
export class SessionManager {
  private static SESSION_KEY = 'demo_session_id';
  private static sessionId: string | null = null;

  static getSessionId(): string {
    if (this.sessionId) return this.sessionId;

    // Try to get from localStorage first
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      this.sessionId = stored;
      return stored;
    }

    // Generate new session ID
    this.sessionId = this.generateSessionId();
    localStorage.setItem(this.SESSION_KEY, this.sessionId);
    return this.sessionId;
  }

  static clearSession(): void {
    this.sessionId = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  private static generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }
}

// Rate limit error types
export interface RateLimitError {
  error: string;
  code: string;
  waitTime?: number;
  limit?: number;
  message?: string;
}

export function isRateLimitError(error: any): error is RateLimitError {
  return error && typeof error === 'object' && 'code' in error && 
    ['SESSION_LIMIT_EXCEEDED', 'IP_LIMIT_EXCEEDED', 'COOLDOWN_ACTIVE'].includes(error.code);
}

export function getRateLimitMessage(error: RateLimitError): string {
  switch (error.code) {
    case 'SESSION_LIMIT_EXCEEDED':
      return 'Demo session limit reached. Sign up for unlimited analyses!';
    case 'IP_LIMIT_EXCEEDED':
      return 'Daily demo limit reached. Sign up for unlimited access!';
    case 'COOLDOWN_ACTIVE':
      return `Please wait ${error.waitTime} seconds before next analysis.`;
    default:
      return error.message || 'Rate limit exceeded. Please try again later.';
  }
} 