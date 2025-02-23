import { useState, useEffect } from 'react';

type MediaQueryList = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
};

const BREAKPOINTS: MediaQueryList = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export const useMediaQuery = (query: keyof MediaQueryList | string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Get the media query string
    const mediaQuery = BREAKPOINTS[query as keyof MediaQueryList] || query;
    
    // Create a media query list
    const mediaQueryList = window.matchMedia(mediaQuery);

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Define callback
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQueryList.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

export const useResponsive = () => {
  const isSm = useMediaQuery('sm');
  const isMd = useMediaQuery('md');
  const isLg = useMediaQuery('lg');
  const isXl = useMediaQuery('xl');
  const is2Xl = useMediaQuery('2xl');

  return {
    isMobile: !isSm,
    isTablet: isSm && !isMd,
    isDesktop: isMd,
    isLargeDesktop: isLg,
    isXLargeDesktop: isXl,
    is2XLargeDesktop: is2Xl,
    // Current breakpoint
    breakpoint: is2Xl ? '2xl' : isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : isSm ? 'sm' : 'xs',
  };
};

// Custom hook for handling touch events
export const useTouch = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouchScreen = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
    setIsTouchDevice(hasTouchScreen);
  }, []);

  return isTouchDevice;
};

// Custom hook for handling window dimensions
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Custom hook for handling scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: typeof window !== 'undefined' ? window.pageXOffset : 0,
    y: typeof window !== 'undefined' ? window.pageYOffset : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

// Custom hook for handling screen orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState({
    angle: typeof window !== 'undefined' ? window.screen.orientation?.angle : 0,
    type: typeof window !== 'undefined' ? window.screen.orientation?.type : 'unknown',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      setOrientation({
        angle: window.screen.orientation?.angle || 0,
        type: window.screen.orientation?.type || 'unknown',
      });
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    handleOrientationChange();

    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  return {
    ...orientation,
    isPortrait: orientation.type.includes('portrait'),
    isLandscape: orientation.type.includes('landscape'),
  };
};

export default {
  useMediaQuery,
  useResponsive,
  useTouch,
  useWindowSize,
  useScrollPosition,
  useOrientation,
};
