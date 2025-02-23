import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';
import { usePreferences } from './usePreferences';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface PageView {
  path: string;
  title: string;
  referrer: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface UseAnalyticsOptions {
  enabled?: boolean;
  debug?: boolean;
  sampleRate?: number;
  excludePaths?: string[];
  customDimensions?: Record<string, any>;
}

const defaultOptions: UseAnalyticsOptions = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  sampleRate: 100, // 100%
  excludePaths: ['/404', '/500', '/api'],
  customDimensions: {},
};

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const {
    enabled,
    debug,
    sampleRate,
    excludePaths,
    customDimensions,
  } = { ...defaultOptions, ...options };

  const router = useRouter();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const sessionId = useRef(Math.random().toString(36).substring(2));
  const queue = useRef<(AnalyticsEvent | PageView)[]>([]);
  const flushInterval = useRef<NodeJS.Timeout>();

  // Check if analytics should be enabled for current user/session
  const shouldTrack = useCallback(() => {
    if (!enabled) return false;
    if (!preferences.privacy.shareAnalytics) return false;
    if (Math.random() * 100 > (sampleRate || 100)) return false;
    if (excludePaths?.some(path => router.pathname.startsWith(path))) return false;
    return true;
  }, [enabled, preferences.privacy.shareAnalytics, sampleRate, excludePaths, router.pathname]);

  // Initialize analytics
  useEffect(() => {
    if (!shouldTrack()) return;

    // Set up periodic queue flushing
    flushInterval.current = setInterval(flushQueue, 30000); // 30 seconds

    return () => {
      if (flushInterval.current) {
        clearInterval(flushInterval.current);
      }
      flushQueue();
    };
  }, [shouldTrack]);

  // Track page views
  useEffect(() => {
    if (!shouldTrack()) return;

    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Track initial page view
    trackPageView(router.asPath);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, shouldTrack]);

  // Flush queued events to analytics endpoint
  const flushQueue = async () => {
    if (queue.current.length === 0) return;

    try {
      const events = [...queue.current];
      queue.current = [];

      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
      });

      if (!response.ok) {
        throw new Error('Failed to send analytics data');
      }

      if (debug) {
        console.log('Analytics data sent:', events);
      }
    } catch (error) {
      if (debug) {
        console.error('Analytics error:', error);
      }
      // Re-queue failed events
      queue.current = [...queue.current, ...queue.current];
    }
  };

  // Track custom event
  const trackEvent = useCallback(
    (category: string, action: string, label?: string, value?: number, metadata?: Record<string, any>) => {
      if (!shouldTrack()) return;

      const event: AnalyticsEvent = {
        category,
        action,
        label,
        value,
        timestamp: Date.now(),
        userId: user?.id,
        sessionId: sessionId.current,
        metadata: {
          ...customDimensions,
          ...metadata,
          path: router.asPath,
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        },
      };

      queue.current.push(event);

      if (debug) {
        console.log('Analytics event:', event);
      }
    },
    [shouldTrack, user?.id, customDimensions, router.asPath, debug]
  );

  // Track page view
  const trackPageView = useCallback(
    (path: string) => {
      if (!shouldTrack()) return;

      const pageView: PageView = {
        path,
        title: document.title,
        referrer: document.referrer,
        timestamp: Date.now(),
        userId: user?.id,
        sessionId: sessionId.current,
        metadata: {
          ...customDimensions,
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        },
      };

      queue.current.push(pageView);

      if (debug) {
        console.log('Page view:', pageView);
      }
    },
    [shouldTrack, user?.id, customDimensions, debug]
  );

  // Track user timing
  const trackTiming = useCallback(
    (category: string, variable: string, value: number, label?: string) => {
      trackEvent('Timing', variable, label, value, { timingCategory: category });
    },
    [trackEvent]
  );

  // Track exceptions
  const trackException = useCallback(
    (error: Error, fatal: boolean = false) => {
      trackEvent('Exception', error.name, error.message, undefined, {
        stack: error.stack,
        fatal,
      });
    },
    [trackEvent]
  );

  // Track social interactions
  const trackSocial = useCallback(
    (network: string, action: string, target: string) => {
      trackEvent('Social', action, target, undefined, { network });
    },
    [trackEvent]
  );

  // Track user engagement
  useEffect(() => {
    if (!shouldTrack()) return;

    let startTime = Date.now();
    let lastInteractionTime = startTime;

    const handleInteraction = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteractionTime;
      
      if (timeSinceLastInteraction > 30000) { // 30 seconds threshold
        trackEvent('Engagement', 'interaction', undefined, timeSinceLastInteraction);
      }
      
      lastInteractionTime = now;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackTiming('Engagement', 'timeOnPage', Date.now() - startTime);
        startTime = Date.now();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldTrack, trackEvent, trackTiming]);

  return {
    trackEvent,
    trackPageView,
    trackTiming,
    trackException,
    trackSocial,
    flushQueue,
  };
};

export default useAnalytics;
