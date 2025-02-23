import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useStorage';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface RouteHistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

interface UseNavigationOptions {
  maxHistoryItems?: number;
  excludePaths?: string[];
  breadcrumbMapping?: Record<string, string>;
  persistHistory?: boolean;
}

const defaultOptions: UseNavigationOptions = {
  maxHistoryItems: 50,
  excludePaths: ['/404', '/500', '/login', '/register'],
  breadcrumbMapping: {
    products: 'Products',
    categories: 'Categories',
    cart: 'Shopping Cart',
    checkout: 'Checkout',
    profile: 'My Profile',
    orders: 'Orders',
  },
  persistHistory: true,
};

export const useNavigation = (options: UseNavigationOptions = {}) => {
  const {
    maxHistoryItems,
    excludePaths,
    breadcrumbMapping,
    persistHistory,
  } = { ...defaultOptions, ...options };

  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [routeHistory, setRouteHistory] = useLocalStorage<RouteHistoryItem[]>(
    'route-history',
    []
  );

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = useCallback(() => {
    const pathSegments = router.asPath.split('?')[0].split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      {
        label: 'Home',
        href: '/',
        isActive: pathSegments.length === 0,
      },
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Handle dynamic routes
      const isDynamicSegment = segment.startsWith('[') && segment.endsWith(']');
      let label = '';

      if (isDynamicSegment) {
        // Try to get a meaningful label from the query params or page props
        const paramName = segment.slice(1, -1);
        const dynamicValue = router.query[paramName];
        label = typeof dynamicValue === 'string' ? dynamicValue : segment;
      } else {
        // Use the mapping if available, otherwise capitalize the segment
        label = breadcrumbMapping?.[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      items.push({
        label,
        href: currentPath,
        isActive: index === pathSegments.length - 1,
      });
    });

    return items;
  }, [router.asPath, router.query, breadcrumbMapping]);

  // Update breadcrumbs when route changes
  useEffect(() => {
    setBreadcrumbs(generateBreadcrumbs());
  }, [router.asPath, generateBreadcrumbs]);

  // Update route history
  useEffect(() => {
    if (!persistHistory) return;

    const currentPath = router.asPath;
    if (excludePaths?.some(path => currentPath.startsWith(path))) return;

    const newHistoryItem: RouteHistoryItem = {
      path: currentPath,
      title: document.title,
      timestamp: Date.now(),
    };

    setRouteHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.path !== currentPath);
      // Add new item at the beginning
      const updated = [newHistoryItem, ...filtered];
      // Limit the number of items
      return updated.slice(0, maxHistoryItems);
    });
  }, [router.asPath, excludePaths, maxHistoryItems, persistHistory, setRouteHistory]);

  // Navigate back
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  // Navigate to a specific route with state preservation
  const navigateTo = useCallback(
    (path: string, options?: { shallow?: boolean; preserveState?: boolean }) => {
      const { shallow = false, preserveState = false } = options || {};
      
      if (preserveState) {
        // Save current scroll position and form data if needed
        const scrollPosition = {
          x: window.scrollX,
          y: window.scrollY,
        };
        sessionStorage.setItem(
          `scroll_${router.asPath}`,
          JSON.stringify(scrollPosition)
        );
      }

      router.push(path, undefined, { shallow });
    },
    [router]
  );

  // Clear route history
  const clearHistory = useCallback(() => {
    setRouteHistory([]);
  }, [setRouteHistory]);

  // Get previous route
  const getPreviousRoute = useCallback(() => {
    return routeHistory[1]?.path;
  }, [routeHistory]);

  // Check if current route is in history
  const isInHistory = useCallback(
    (path: string) => {
      return routeHistory.some(item => item.path === path);
    },
    [routeHistory]
  );

  // Get route history for a specific timeframe
  const getHistoryByTimeframe = useCallback(
    (startTime: number, endTime: number = Date.now()) => {
      return routeHistory.filter(
        item => item.timestamp >= startTime && item.timestamp <= endTime
      );
    },
    [routeHistory]
  );

  return {
    breadcrumbs,
    routeHistory,
    currentPath: router.asPath,
    goBack,
    navigateTo,
    clearHistory,
    getPreviousRoute,
    isInHistory,
    getHistoryByTimeframe,
    // Additional router properties
    query: router.query,
    isReady: router.isReady,
    isFallback: router.isFallback,
    // Helper methods
    generateBreadcrumbs,
  };
};

// Helper function to format breadcrumbs for structured data
export const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@id': item.href,
        name: item.label,
      },
    })),
  };
};

export default useNavigation;
