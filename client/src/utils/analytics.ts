// Analytics tracking for RecruiterCopilot.ai
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
    this.setupPageTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents() {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics events:', error);
    }
  }

  private saveEvents() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Failed to save analytics events:', error);
    }
  }

  private setupPageTracking() {
    // Track page views
    this.track('page_view', {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      this.track('page_exit', {
        timeOnPage,
        url: window.location.href,
      });
    });
  }

  setUser(userId: string) {
    this.userId = userId;
    this.track('user_login', { userId });
  }

  track(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        timestamp_iso: new Date().toISOString(),
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.events.push(event);
    this.saveEvents();
    
    // Send to analytics service (implement based on your choice)
    this.sendToAnalyticsService(event);
    
    // Log analytics events
    console.log('📊 Analytics:', event);
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // You can replace this with your analytics service (GA, Mixpanel, etc.)
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silently fail if no analytics endpoint
      });
    } catch (error) {
      // Silently handle analytics errors
    }
  }

  // Specific tracking methods for key events
  trackFeatureUsage(feature: string, details: Record<string, any> = {}) {
    this.track('feature_used', {
      feature,
      ...details,
    });
  }

  trackConversion(type: string, value?: number) {
    this.track('conversion', {
      type,
      value,
      conversionPath: this.getConversionPath(),
    });
  }

  trackError(error: string, context: Record<string, any> = {}) {
    this.track('error', {
      error,
      ...context,
    });
  }

  trackTiming(action: string, duration: number, details: Record<string, any> = {}) {
    this.track('timing', {
      action,
      duration,
      ...details,
    });
  }

  private getConversionPath(): string[] {
    return this.events
      .filter(e => ['page_view', 'feature_used', 'demo_action'].includes(e.name))
      .map(e => e.name)
      .slice(-10); // Last 10 actions
  }

  // Get analytics data for dashboard
  getAnalyticsData() {
    return {
      totalEvents: this.events.length,
      sessionId: this.sessionId,
      events: this.events,
      userJourney: this.getConversionPath(),
    };
  }
}

// Create global analytics instance
export const analytics = new Analytics();

// Convenience functions for common tracking
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackDemo = (action: string, details?: Record<string, any>) => {
  analytics.track('demo_action', { action, ...details });
};

export const trackUpload = (type: 'job' | 'candidate', success: boolean, details?: Record<string, any>) => {
  analytics.trackFeatureUsage('file_upload', { type, success, ...details });
};

export const trackAnalysis = (matchPercentage: number, candidateId: string, jobId: string) => {
  analytics.trackFeatureUsage('ai_analysis', { 
    matchPercentage, 
    candidateId, 
    jobId,
    matchCategory: matchPercentage >= 80 ? 'high' : matchPercentage >= 60 ? 'medium' : 'low'
  });
};

export const trackSignupIntent = (trigger: 'exit_intent' | 'save_button' | 'timer' | 'manual' | 'page_exit') => {
  analytics.track('signup_intent', { trigger });
};

export const trackConversion = (type: 'signup' | 'login', _method?: string) => {
  analytics.trackConversion(type, 1);
};

export default analytics; 