import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useStorage';

interface SearchOptions<T> {
  initialQuery?: string;
  debounceTime?: number;
  minChars?: number;
  maxResults?: number;
  searchFn?: (query: string) => Promise<T[]>;
  cacheResults?: boolean;
  cacheTimeout?: number;
  onSearch?: (results: T[]) => void;
  onError?: (error: Error) => void;
}

interface CachedResult<T> {
  data: T[];
  timestamp: number;
}

interface SearchCache<T> {
  [query: string]: CachedResult<T>;
}

export function useSearch<T>({
  initialQuery = '',
  debounceTime = 300,
  minChars = 2,
  maxResults = 10,
  searchFn,
  cacheResults = true,
  cacheTimeout = 5 * 60 * 1000, // 5 minutes
  onSearch,
  onError,
}: SearchOptions<T> = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  
  // Use local storage for caching search results
  const [searchCache, setSearchCache] = useLocalStorage<SearchCache<T>>(
    'search-cache',
    {}
  );

  // Clear expired cache entries
  const clearExpiredCache = useCallback(() => {
    if (!cacheResults) return;
    
    const now = Date.now();
    const newCache = { ...searchCache };
    let hasChanges = false;

    Object.entries(newCache).forEach(([key, value]) => {
      if (now - value.timestamp > cacheTimeout) {
        delete newCache[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setSearchCache(newCache);
    }
  }, [cacheResults, cacheTimeout, searchCache, setSearchCache]);

  // Check cache for results
  const getCachedResults = useCallback(
    (searchQuery: string): T[] | null => {
      if (!cacheResults) return null;

      const cached = searchCache[searchQuery];
      if (!cached) return null;

      const now = Date.now();
      if (now - cached.timestamp > cacheTimeout) {
        // Cache expired, remove it
        const newCache = { ...searchCache };
        delete newCache[searchQuery];
        setSearchCache(newCache);
        return null;
      }

      return cached.data;
    },
    [cacheResults, cacheTimeout, searchCache, setSearchCache]
  );

  // Cache results
  const cacheResults_ = useCallback(
    (searchQuery: string, data: T[]) => {
      if (!cacheResults) return;

      setSearchCache((prev) => ({
        ...prev,
        [searchQuery]: {
          data,
          timestamp: Date.now(),
        },
      }));
    },
    [cacheResults, setSearchCache]
  );

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < minChars) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedResults = getCachedResults(searchQuery);
        if (cachedResults) {
          setResults(cachedResults.slice(0, maxResults));
          onSearch?.(cachedResults.slice(0, maxResults));
          return;
        }

        // Perform search if no cached results
        if (searchFn) {
          const searchResults = await searchFn(searchQuery);
          const limitedResults = searchResults.slice(0, maxResults);
          
          setResults(limitedResults);
          onSearch?.(limitedResults);
          
          // Cache the results
          cacheResults_(searchQuery, searchResults);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Search failed');
        setError(error);
        onError?.(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [
      minChars,
      maxResults,
      searchFn,
      getCachedResults,
      cacheResults_,
      onSearch,
      onError,
    ]
  );

  // Debounced search
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        performSearch(searchQuery);
      }, debounceTime);
    },
    [debounceTime, performSearch]
  );

  // Handle query changes
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      debouncedSearch(newQuery);
    },
    [debouncedSearch]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  // Clear expired cache entries periodically
  useEffect(() => {
    const interval = setInterval(clearExpiredCache, cacheTimeout / 2);
    return () => clearInterval(interval);
  }, [clearExpiredCache, cacheTimeout]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    error,
    setQuery: handleQueryChange,
    clearSearch,
    clearCache: useCallback(() => setSearchCache({}), [setSearchCache]),
  };
}

// Hook for handling search suggestions
interface UseSuggestionsOptions<T> {
  maxSuggestions?: number;
  minChars?: number;
  getSuggestions?: (query: string) => Promise<T[]>;
  onSelect?: (suggestion: T) => void;
}

export function useSuggestions<T>({
  maxSuggestions = 5,
  minChars = 1,
  getSuggestions,
  onSelect,
}: UseSuggestionsOptions<T> = {}) {
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const search = useSearch<T>({
    debounceTime: 200,
    minChars,
    maxResults: maxSuggestions,
    searchFn: getSuggestions,
    onSearch: setSuggestions,
    onError: setError,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!suggestions.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            e.preventDefault();
            onSelect?.(suggestions[selectedIndex]);
            search.clearSearch();
          }
          break;
        case 'Escape':
          e.preventDefault();
          search.clearSearch();
          break;
      }
    },
    [suggestions, selectedIndex, onSelect, search]
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  return {
    ...search,
    suggestions,
    loading,
    error,
    selectedIndex,
    handleKeyDown,
    selectSuggestion: useCallback(
      (suggestion: T) => {
        onSelect?.(suggestion);
        search.clearSearch();
      },
      [onSelect, search]
    ),
  };
}

export default {
  useSearch,
  useSuggestions,
};
