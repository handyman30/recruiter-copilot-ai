// Analytics tracking for RecruiterCopilot.ai
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
mixpanel.init('839185b12bce4c278ad6b10c22aa14a8');

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
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

  setUserId(userId: string) {
    this.userId = userId;
    // Identify user in Mixpanel
    mixpanel.identify(userId);
  }

  clearUserId() {
    this.userId = undefined;
    // Reset Mixpanel identity
    mixpanel.reset();
  }

  private sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // Send to Mixpanel
      mixpanel.track(event.name, {
        ...event.properties,
        sessionId: event.sessionId,
        userId: event.userId,
        timestamp: event.timestamp
      });
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', event);
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
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
    
    // Send to Mixpanel
    this.sendToAnalyticsService(event);
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Track specific event types
  trackPageView(path: string) {
    this.track('page_view', { 
      path,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }

  trackFeatureUsed(feature: string, properties?: Record<string, any>) {
    this.track('feature_used', { feature, ...properties });
  }

  trackError(error: string, context?: Record<string, any>) {
    this.track('error', { error, context });
  }

  trackConversion(type: string, value?: number) {
    this.track('conversion', { type, value });
  }
}

// Global analytics instance
const analytics = new Analytics();

// Export the instance and convenience functions
export { analytics };

// Convenience functions for common tracking
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackDemo = (action: string, details?: Record<string, any>) => {
  analytics.track('demo_action', { action, ...details });
};

export const trackPageView = (path: string) => {
  analytics.trackPageView(path);
};

export const trackFeatureUsed = (feature: string, properties?: Record<string, any>) => {
  analytics.trackFeatureUsed(feature, properties);
};

export const trackError = (error: string, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackConversion = (type: string, value?: number) => {
  analytics.trackConversion(type, value);
};

export const trackSignupIntent = (trigger: string) => {
  analytics.track('signup_intent', { trigger });
};

export const trackAnalysisCompleted = (matchPercentage: number, trigger: string, mode: string) => {
  analytics.track('analysis_completed', { matchPercentage, trigger, mode });
};

export const trackAnalysisFailed = (error: string, mode: string) => {
  analytics.track('analysis_failed', { error, mode });
};

export const setUserId = (userId: string) => {
  analytics.setUserId(userId);
};

export const clearUserId = () => {
  analytics.clearUserId();
}; 