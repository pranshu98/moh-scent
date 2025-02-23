import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export const useTheme = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isDarkMode = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  // Color scheme preferences
  const colors = {
    primary: isDarkMode ? '#8b5cf6' : '#6d28d9', // purple-600 : purple-700
    secondary: isDarkMode ? '#ec4899' : '#db2777', // pink-500 : pink-600
    background: isDarkMode ? '#111827' : '#ffffff', // gray-900 : white
    text: isDarkMode ? '#f3f4f6' : '#111827', // gray-100 : gray-900
    border: isDarkMode ? '#374151' : '#e5e7eb', // gray-700 : gray-200
    input: isDarkMode ? '#1f2937' : '#f9fafb', // gray-800 : gray-50
  };

  // CSS Variables for dynamic theme colors
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [mounted, isDarkMode]);

  return {
    theme,
    setTheme,
    isDarkMode,
    toggleTheme,
    mounted,
    colors,
  };
};

export default useTheme;
