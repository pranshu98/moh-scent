import { useEffect, useCallback, useState } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = { [key: string]: KeyHandler };
type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';

interface KeyCombo {
  key: string;
  modifiers?: ModifierKey[];
  handler: KeyHandler;
  preventDefault?: boolean;
}

interface UseKeyboardOptions {
  targetKey?: string;
  modifiers?: ModifierKey[];
  preventDefault?: boolean;
  keyup?: boolean;
  disabled?: boolean;
}

// Hook for handling a single keyboard shortcut
export const useKeyboard = (
  handler: KeyHandler,
  options: UseKeyboardOptions = {}
) => {
  const {
    targetKey,
    modifiers = [],
    preventDefault = true,
    keyup = false,
    disabled = false,
  } = options;

  useEffect(() => {
    if (disabled) return;

    const eventHandler = (event: KeyboardEvent) => {
      if (targetKey && event.key.toLowerCase() !== targetKey.toLowerCase()) {
        return;
      }

      const modifiersPressed = modifiers.every((modifier) => {
        switch (modifier) {
          case 'ctrl':
            return event.ctrlKey;
          case 'alt':
            return event.altKey;
          case 'shift':
            return event.shiftKey;
          case 'meta':
            return event.metaKey;
          default:
            return false;
        }
      });

      if (!modifiersPressed) return;

      if (preventDefault) {
        event.preventDefault();
      }

      handler(event);
    };

    const eventType = keyup ? 'keyup' : 'keydown';
    window.addEventListener(eventType, eventHandler);

    return () => {
      window.removeEventListener(eventType, eventHandler);
    };
  }, [handler, targetKey, modifiers, preventDefault, keyup, disabled]);
};

// Hook for handling multiple keyboard shortcuts
export const useKeyboardMap = (keyMap: KeyCombo[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const { key, modifiers = [], handler, preventDefault = true } of keyMap) {
        if (event.key.toLowerCase() !== key.toLowerCase()) continue;

        const modifiersPressed = modifiers.every((modifier) => {
          switch (modifier) {
            case 'ctrl':
              return event.ctrlKey;
            case 'alt':
              return event.altKey;
            case 'shift':
              return event.shiftKey;
            case 'meta':
              return event.metaKey;
            default:
              return false;
          }
        });

        if (!modifiersPressed) continue;

        if (preventDefault) {
          event.preventDefault();
        }

        handler(event);
        break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyMap]);
};

// Hook for handling keyboard focus
export const useFocus = (initialFocus = false) => {
  const [isFocused, setIsFocused] = useState(initialFocus);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return {
    isFocused,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
};

// Hook for handling keyboard navigation
export const useKeyboardNav = (
  itemCount: number,
  onSelect: (index: number) => void,
  options: { loop?: boolean; vertical?: boolean } = {}
) => {
  const { loop = true, vertical = true } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      let newIndex = activeIndex;

      if (vertical) {
        if (event.key === 'ArrowUp') {
          newIndex = activeIndex - 1;
        } else if (event.key === 'ArrowDown') {
          newIndex = activeIndex + 1;
        }
      } else {
        if (event.key === 'ArrowLeft') {
          newIndex = activeIndex - 1;
        } else if (event.key === 'ArrowRight') {
          newIndex = activeIndex + 1;
        }
      }

      if (event.key === 'Enter' || event.key === ' ') {
        onSelect(activeIndex);
        return;
      }

      if (loop) {
        if (newIndex < 0) {
          newIndex = itemCount - 1;
        } else if (newIndex >= itemCount) {
          newIndex = 0;
        }
      } else {
        if (newIndex < 0 || newIndex >= itemCount) {
          return;
        }
      }

      setActiveIndex(newIndex);
    },
    [activeIndex, itemCount, loop, vertical, onSelect]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    activeIndex,
    setActiveIndex,
  };
};

// Hook for handling keyboard shortcuts help dialog
export const useKeyboardHelp = (shortcuts: { key: string; description: string }[]) => {
  const [showHelp, setShowHelp] = useState(false);

  useKeyboard(
    () => setShowHelp((prev) => !prev),
    {
      targetKey: '?',
      modifiers: ['shift'],
    }
  );

  return {
    showHelp,
    setShowHelp,
    shortcuts,
  };
};

export default {
  useKeyboard,
  useKeyboardMap,
  useFocus,
  useKeyboardNav,
  useKeyboardHelp,
};
