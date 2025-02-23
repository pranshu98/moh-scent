import { useState, useEffect, useCallback } from 'react';

type StorageType = 'localStorage' | 'sessionStorage';

interface StorageConfig {
  storage?: StorageType;
  serializer?: (value: any) => string;
  deserializer?: (value: string) => any;
}

const defaultSerializer = JSON.stringify;
const defaultDeserializer = JSON.parse;

function getStorageImplementation(type: StorageType): Storage {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => null,
      removeItem: () => null,
      clear: () => null,
      key: () => null,
      length: 0,
    } as Storage;
  }
  return type === 'localStorage' ? window.localStorage : window.sessionStorage;
}

export function useStorage<T>(
  key: string,
  initialValue: T,
  config: StorageConfig = {}
) {
  const {
    storage = 'localStorage',
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
  } = config;

  const storageImplementation = getStorageImplementation(storage);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = storageImplementation.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading ${storage} key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = typeof value === 'function'
          ? (value as (val: T) => T)(storedValue)
          : value;
        
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          storageImplementation.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting ${storage} key "${key}":`, error);
      }
    },
    [key, serializer, storage, storageImplementation, storedValue]
  );

  const removeItem = useCallback(() => {
    try {
      storageImplementation.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing ${storage} key "${key}":`, error);
    }
  }, [initialValue, key, storage, storageImplementation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleStorageChange(e: StorageEvent) {
      if (e.key === key && e.storageArea === storageImplementation) {
        try {
          const newValue = e.newValue ? deserializer(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error syncing ${storage} key "${key}":`, error);
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [deserializer, initialValue, key, storage, storageImplementation]);

  return [storedValue, setValue, removeItem] as const;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  config: Omit<StorageConfig, 'storage'> = {}
) {
  return useStorage(key, initialValue, { ...config, storage: 'localStorage' });
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  config: Omit<StorageConfig, 'storage'> = {}
) {
  return useStorage(key, initialValue, { ...config, storage: 'sessionStorage' });
}

type StorageMap<T> = {
  [K in keyof T]: T[K];
};

export function useStorageMap<T extends StorageMap<T>>(
  initialValues: T,
  config: StorageConfig = {}
) {
  const {
    storage = 'localStorage',
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
  } = config;

  const storageImplementation = getStorageImplementation(storage);

  const [values, setValues] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValues;

    const storedValues = { ...initialValues };
    
    (Object.keys(initialValues) as Array<keyof T>).forEach((key) => {
      try {
        const item = storageImplementation.getItem(String(key));
        if (item) {
          storedValues[key] = deserializer(item);
        }
      } catch (error) {
        console.warn(`Error reading ${storage} key "${String(key)}":`, error);
      }
    });

    return storedValues;
  });

  const setStorageItem = useCallback(
    <K extends keyof T>(key: K, value: T[K] | ((prev: T[K]) => T[K])) => {
      try {
        const valueToStore = typeof value === 'function'
          ? (value as (prev: T[K]) => T[K])(values[key])
          : value;
        
        setValues((prev) => ({ ...prev, [key]: valueToStore }));
        
        if (typeof window !== 'undefined') {
          storageImplementation.setItem(String(key), serializer(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting ${storage} key "${String(key)}":`, error);
      }
    },
    [serializer, storage, storageImplementation, values]
  );

  const removeStorageItem = useCallback(
    (key: keyof T) => {
      try {
        storageImplementation.removeItem(String(key));
        setValues((prev) => {
          const newValues = { ...prev };
          delete newValues[key];
          return newValues;
        });
      } catch (error) {
        console.warn(`Error removing ${storage} key "${String(key)}":`, error);
      }
    },
    [storage, storageImplementation]
  );

  const clearStorage = useCallback(() => {
    try {
      (Object.keys(values) as Array<keyof T>).forEach((key) => {
        storageImplementation.removeItem(String(key));
      });
      setValues({} as T);
    } catch (error) {
      console.warn(`Error clearing ${storage}:`, error);
    }
  }, [storage, storageImplementation, values]);

  return {
    values,
    setItem: setStorageItem,
    removeItem: removeStorageItem,
    clear: clearStorage,
  };
}

export default {
  useStorage,
  useLocalStorage,
  useSessionStorage,
  useStorageMap,
};
