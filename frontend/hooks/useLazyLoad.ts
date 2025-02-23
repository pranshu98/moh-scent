import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  fallback?: React.ReactNode;
  ssr?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

const defaultOptions: LazyLoadOptions = {
  threshold: 0.1,
  rootMargin: '50px',
  triggerOnce: true,
  ssr: false,
  retryOnError: true,
  maxRetries: 3,
  retryDelay: 1000,
};

export const useLazyLoad = <T extends any>(
  loader: () => Promise<T>,
  options: LazyLoadOptions = {}
) => {
  const {
    threshold,
    rootMargin,
    triggerOnce,
    retryOnError,
    maxRetries,
    retryDelay,
  } = { ...defaultOptions, ...options };

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const retryCount = useRef(0);
  const mounted = useRef(false);

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const load = useCallback(async () => {
    if (loading || data || (error && !retryOnError)) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      if (mounted.current) {
        setData(result);
        setLoading(false);
        retryCount.current = 0;
      }
    } catch (err) {
      if (mounted.current) {
        setError(err as Error);
        setLoading(false);

        if (retryOnError && retryCount.current < (maxRetries || 0)) {
          setTimeout(() => {
            retryCount.current++;
            load();
          }, retryDelay);
        }
      }
    }
  }, [loader, loading, data, error, retryOnError, maxRetries, retryDelay]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (inView) {
      load();
    }
  }, [inView, load]);

  return {
    ref,
    data,
    error,
    loading,
    load,
    retry: load,
    inView,
  };
};

// Helper function to create lazy-loaded components
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: { ssr?: boolean } = {}
) {
  return dynamic(importFunc, {
    ssr: options.ssr ?? false,
  });
}

// Hook for lazy loading images
export const useLazyImage = (
  src: string,
  options: LazyLoadOptions = {}
) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { ref, inView } = useInView(options);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!inView || loaded) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setLoaded(true);
      if (imgRef.current) {
        imgRef.current.src = src;
      }
    };

    img.onerror = () => {
      setError(new Error(`Failed to load image: ${src}`));
    };
  }, [inView, src, loaded]);

  return {
    ref,
    imgRef,
    loaded,
    error,
    inView,
  };
};

// Hook for lazy loading data based on scroll position
export const useInfiniteLoad = <T extends any>(
  loader: (page: number) => Promise<T[]>,
  options: LazyLoadOptions & { initialPage?: number } = {}
) => {
  const { initialPage = 1 } = options;
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView(options);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await loader(page);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [loader, page, loading, hasMore]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  return {
    ref,
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset: useCallback(() => {
      setItems([]);
      setPage(initialPage);
      setHasMore(true);
      setError(null);
    }, [initialPage]),
  };
};

export default {
  useLazyLoad,
  lazyLoad,
  useLazyImage,
  useInfiniteLoad,
};
