import { useState, useEffect, useCallback, useRef } from 'react';
import { useMediaQuery } from './useMediaQuery';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  loading?: boolean;
  hasMore?: boolean;
}

interface UseInfiniteScrollReturn {
  observerRef: (node: Element | null) => void;
  isLoading: boolean;
  hasMore: boolean;
  resetObserver: () => void;
}

export const useInfiniteScroll = (
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enabled = true,
    loading: externalLoading,
    hasMore: externalHasMore = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const isMobile = useMediaQuery('sm');

  // Reset function
  const resetObserver = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    setHasMore(true);
    loadingRef.current = false;
  }, []);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Update loading state from external source
  useEffect(() => {
    if (typeof externalLoading !== 'undefined') {
      setIsLoading(externalLoading);
      loadingRef.current = externalLoading;
    }
  }, [externalLoading]);

  // Update hasMore state from external source
  useEffect(() => {
    setHasMore(externalHasMore);
  }, [externalHasMore]);

  const observerCallback = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        enabled &&
        hasMore &&
        !loadingRef.current
      ) {
        try {
          loadingRef.current = true;
          setIsLoading(true);
          await onLoadMore();
        } catch (error) {
          console.error('Error loading more items:', error);
          setHasMore(false);
        } finally {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [enabled, hasMore, onLoadMore]
  );

  const observerRef = useCallback(
    (node: Element | null) => {
      if (!enabled) return;
      if (loadingRef.current) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(observerCallback, {
        root: null,
        rootMargin: isMobile ? '150px' : rootMargin,
        threshold,
      });

      if (node) observer.current.observe(node);
    },
    [enabled, observerCallback, rootMargin, threshold, isMobile]
  );

  return {
    observerRef,
    isLoading,
    hasMore,
    resetObserver,
  };
};

// Hook for handling paginated data
interface UsePaginationOptions<T> {
  initialPage?: number;
  pageSize?: number;
  initialData?: T[];
  total?: number;
}

interface UsePaginationReturn<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  setData: (data: T[]) => void;
  setTotal: (total: number) => void;
}

export function usePagination<T>({
  initialPage = 1,
  pageSize: initialPageSize = 10,
  initialData = [],
  total: initialTotal = 0,
}: UsePaginationOptions<T> = {}): UsePaginationReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage((p) => p - 1);
    }
  }, [hasPrevPage]);

  // Reset page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  return {
    data,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    nextPage,
    prevPage,
    setPageSize,
    setData,
    setTotal,
  };
}

export default {
  useInfiniteScroll,
  usePagination,
};
