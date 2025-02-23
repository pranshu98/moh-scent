import { useCallback } from 'react';
import { useLocalStorage } from './useStorage';
import { useTheme } from './useTheme';
import { useNotification } from './useNotification';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  display: {
    gridView: boolean;
    productsPerPage: number;
    showPrices: boolean;
    sortOrder: 'asc' | 'desc';
    sortBy: 'name' | 'price' | 'date' | 'popularity';
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    contrast: 'normal' | 'high';
    reducedMotion: boolean;
    enableKeyboardShortcuts: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    cookiePreferences: {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
    };
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    orderUpdates: true,
    promotions: false,
  },
  display: {
    gridView: true,
    productsPerPage: 12,
    showPrices: true,
    sortOrder: 'desc',
    sortBy: 'popularity',
  },
  accessibility: {
    fontSize: 'medium',
    contrast: 'normal',
    reducedMotion: false,
    enableKeyboardShortcuts: true,
  },
  privacy: {
    shareAnalytics: true,
    cookiePreferences: {
      necessary: true,
      analytics: true,
      marketing: false,
    },
  },
};

export const usePreferences = () => {
  const { setTheme } = useTheme();
  const notify = useNotification();
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'user-preferences',
    defaultPreferences
  );

  // Update theme preference
  const updateTheme = useCallback(
    (theme: UserPreferences['theme']) => {
      setPreferences((prev) => ({ ...prev, theme }));
      setTheme(theme);
      notify.success('Theme updated successfully');
    },
    [setPreferences, setTheme, notify]
  );

  // Update language preference
  const updateLanguage = useCallback(
    (language: string) => {
      setPreferences((prev) => ({ ...prev, language }));
      document.documentElement.lang = language;
      notify.success('Language updated successfully');
    },
    [setPreferences, notify]
  );

  // Update currency preference
  const updateCurrency = useCallback(
    (currency: string) => {
      setPreferences((prev) => ({ ...prev, currency }));
      notify.success('Currency updated successfully');
    },
    [setPreferences, notify]
  );

  // Update notification preferences
  const updateNotifications = useCallback(
    (notifications: Partial<UserPreferences['notifications']>) => {
      setPreferences((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...notifications },
      }));
      notify.success('Notification preferences updated');
    },
    [setPreferences, notify]
  );

  // Update display preferences
  const updateDisplay = useCallback(
    (display: Partial<UserPreferences['display']>) => {
      setPreferences((prev) => ({
        ...prev,
        display: { ...prev.display, ...display },
      }));
      notify.success('Display preferences updated');
    },
    [setPreferences, notify]
  );

  // Update accessibility preferences
  const updateAccessibility = useCallback(
    (accessibility: Partial<UserPreferences['accessibility']>) => {
      setPreferences((prev) => ({
        ...prev,
        accessibility: { ...prev.accessibility, ...accessibility },
      }));

      // Apply accessibility changes
      const { fontSize, contrast, reducedMotion } = {
        ...preferences.accessibility,
        ...accessibility,
      };

      document.documentElement.style.fontSize = {
        small: '14px',
        medium: '16px',
        large: '18px',
      }[fontSize];

      document.documentElement.classList.toggle('high-contrast', contrast === 'high');
      document.documentElement.classList.toggle('reduce-motion', reducedMotion);

      notify.success('Accessibility preferences updated');
    },
    [setPreferences, preferences.accessibility, notify]
  );

  // Update privacy preferences
  const updatePrivacy = useCallback(
    (privacy: Partial<UserPreferences['privacy']>) => {
      setPreferences((prev) => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          ...privacy,
          cookiePreferences: {
            ...prev.privacy.cookiePreferences,
            ...(privacy.cookiePreferences || {}),
          },
        },
      }));
      notify.success('Privacy preferences updated');
    },
    [setPreferences, notify]
  );

  // Reset all preferences to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    setTheme(defaultPreferences.theme);
    document.documentElement.lang = defaultPreferences.language;
    notify.success('Preferences reset to defaults');
  }, [setPreferences, setTheme, notify]);

  // Export preferences
  const exportPreferences = useCallback(() => {
    const data = JSON.stringify(preferences, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'preferences.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [preferences]);

  // Import preferences
  const importPreferences = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        setPreferences(imported);
        setTheme(imported.theme);
        document.documentElement.lang = imported.language;
        notify.success('Preferences imported successfully');
      } catch (error) {
        notify.error('Failed to import preferences');
        console.error('Import preferences error:', error);
      }
    },
    [setPreferences, setTheme, notify]
  );

  return {
    preferences,
    updateTheme,
    updateLanguage,
    updateCurrency,
    updateNotifications,
    updateDisplay,
    updateAccessibility,
    updatePrivacy,
    resetPreferences,
    exportPreferences,
    importPreferences,
  };
};

export default usePreferences;
