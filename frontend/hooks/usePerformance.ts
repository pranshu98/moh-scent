import { useEffect, useCallback, useRef } from 'react';
import { useAnalytics } from './useAnalytics';

interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  TTI: number; // Time to Interactive
}

interface PerformanceOptions {
  enabled?: boolean;
  sampleRate?: number;
  reportToAnalytics?: boolean;
  logToConsole?: boolean;
  metricThresholds?: Partial<PerformanceMetrics>;
}

const defaultOptions: PerformanceOptions = {
  enabled: true,
  sampleRate: 100,
  reportToAnalytics: true,
  logToConsole: process.env.NODE_ENV === 'development',
  metricThresholds: {
    FCP: 2000,
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    TTFB: 600,
    TTI: 3500,
  },
};

export const usePerformance = (options: PerformanceOptions = {}) => {
  const {
    enabled,
    sampleRate,
    reportToAnalytics,
    logToConsole,
    metricThresholds,
  } = { ...defaultOptions, ...options };

  const { trackEvent } = useAnalytics();
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  const shouldMonitor = useCallback(() => {
    if (!enabled) return false;
    if (typeof window === 'undefined' || !window.performance) return false;
    if (Math.random() * 100 > (sampleRate || 100)) return false;
    return true;
  }, [enabled, sampleRate]);

  const reportMetric = useCallback(
    (name: string, value: number) => {
      if (!shouldMonitor()) return;

      metricsRef.current[name as keyof PerformanceMetrics] = value;

      if (reportToAnalytics) {
        const threshold = metricThresholds?.[name as keyof PerformanceMetrics];
        if (threshold && value > threshold) {
          trackEvent('Performance', 'ThresholdExceeded', name, value);
        }
        trackEvent('Performance', 'Metric', name, value);
      }

      if (logToConsole) {
        const threshold = metricThresholds?.[name as keyof PerformanceMetrics];
        console.log(
          `Performance metric - ${name}: ${value}ms${
            threshold ? ` (threshold: ${threshold}ms)` : ''
          }`
        );
      }
    },
    [shouldMonitor, reportToAnalytics, logToConsole, metricThresholds, trackEvent]
  );

  useEffect(() => {
    if (!shouldMonitor()) return;

    // First Contentful Paint
    const paintObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          reportMetric('FCP', entry.startTime);
        }
      });
    });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        reportMetric('LCP', lastEntry.startTime);
      }
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        const value = entry.processingStart - entry.startTime;
        reportMetric('FID', value);
      });
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      entryList.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      reportMetric('CLS', clsValue);
    });

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart;
      reportMetric('TTFB', ttfb);
    }

    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance API not fully supported:', error);
    }

    return () => {
      paintObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [shouldMonitor, reportMetric]);

  return {
    getMetrics: useCallback(() => ({ ...metricsRef.current }), []),
    getMetric: useCallback(
      (metric: keyof PerformanceMetrics) => metricsRef.current[metric],
      []
    ),
    clearMetrics: useCallback(() => {
      metricsRef.current = {};
    }, []),
  };
};

export default usePerformance;
