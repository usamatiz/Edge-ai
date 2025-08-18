"use client";

import { useCallback } from "react";

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

interface NavigationEvent extends AnalyticsEvent {
  event: "navigation";
  properties: {
    from: string;
    to: string;
    method: "click" | "keyboard" | "programmatic";
  };
}

interface ButtonClickEvent extends AnalyticsEvent {
  event: "button_click";
  properties: {
    button: string;
    location: string;
    action: string;
  };
}

interface CustomEvent extends AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
}

type TrackableEvent = NavigationEvent | ButtonClickEvent | CustomEvent;

// Type definitions for analytics services
interface GoogleAnalytics {
  gtag: (command: string, eventName: string, parameters?: Record<string, unknown>) => void;
}

interface Mixpanel {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
}

interface WindowWithAnalytics extends Window {
  gtag?: GoogleAnalytics['gtag'];
  mixpanel?: Mixpanel;
}

class Analytics {
  private events: TrackableEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === "production" || 
                    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
  }

  track(event: TrackableEvent): void {
    if (!this.isEnabled) {
      // In development, just log to console
      console.log("Analytics Event:", event);
      return;
    }

    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    this.events.push(event);

    // In production, you would send this to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    this.sendToAnalyticsService(event);
  }

  private sendToAnalyticsService(event: TrackableEvent): void {
    // Example implementation for Google Analytics 4
    if (typeof window !== "undefined" && (window as WindowWithAnalytics).gtag) {
      (window as WindowWithAnalytics).gtag!("event", event.event, event.properties);
    }

    // Example implementation for Mixpanel
    if (typeof window !== "undefined" && (window as WindowWithAnalytics).mixpanel) {
      (window as WindowWithAnalytics).mixpanel!.track(event.event, event.properties);
    }

    // Example implementation for custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.error("Failed to send analytics event:", error);
      });
    }
  }

  getEvents(): TrackableEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

// Global analytics instance
const analytics = new Analytics();

export function useAnalytics() {
  const trackNavigation = useCallback((from: string, to: string, method: "click" | "keyboard" | "programmatic" = "click") => {
    analytics.track({
      event: "navigation",
      properties: {
        from,
        to,
        method,
      },
    });
  }, []);

  const trackButtonClick = useCallback((button: string, location: string, action: string) => {
    analytics.track({
      event: "button_click",
      properties: {
        button,
        location,
        action,
      },
    });
  }, []);

  const trackCustomEvent = useCallback((event: string, properties?: Record<string, unknown>) => {
    analytics.track({
      event,
      properties,
    } as CustomEvent);
  }, []);

  return {
    trackNavigation,
    trackButtonClick,
    trackCustomEvent,
    getEvents: analytics.getEvents.bind(analytics),
    clearEvents: analytics.clearEvents.bind(analytics),
  };
}
