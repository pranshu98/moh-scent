import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';
import { useStorage } from './useStorage';

interface SyncOptions {
  syncInterval?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  enableOfflineMode?: boolean;
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  data?: any;
  timestamp: number;
  retryCount: number;
}

interface SyncState {
  lastSyncTime: number;
  isSyncing: boolean;
  isOnline: boolean;
  pendingChanges: number;
  syncErrors: Error[];
}

const defaultOptions: SyncOptions = {
  syncInterval: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds
  enableOfflineMode: true,
};

export const useSync = (options: SyncOptions = {}) => {
  const {
    syncInterval,
    retryAttempts,
    retryDelay,
    onSyncStart,
    onSyncComplete,
    onSyncError,
    enableOfflineMode,
  } = { ...defaultOptions, ...options };

  const { user } = useAuth();
  const notify = useNotification();
  const [syncQueue, setSyncQueue] = useStorage<SyncQueueItem[]>('sync-queue', []);
  const [state, setState] = useState<SyncState>({
    lastSyncTime: 0,
    isSyncing: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingChanges: 0,
    syncErrors: [],
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket>();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      notify.success('Back online. Syncing changes...');
      syncData();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      notify.info('You are offline. Changes will be synced when back online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notify]);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!user || !state.isOnline || wsRef.current) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL as string);

    ws.onopen = () => {
      wsRef.current = ws;
      ws.send(JSON.stringify({ type: 'auth', token: user.token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleRealtimeUpdate(data);
    };

    ws.onclose = () => {
      wsRef.current = undefined;
      // Attempt to reconnect after a delay
      setTimeout(initializeWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };
  }, [user, state.isOnline]);

  // Handle realtime updates
  const handleRealtimeUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'update':
        notify.info(`${data.entity} updated`);
        break;
      case 'delete':
        notify.info(`${data.entity} deleted`);
        break;
      case 'sync_required':
        syncData();
        break;
    }
  }, [notify]);

  // Add item to sync queue
  const addToSyncQueue = useCallback(
    (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
      const newItem: SyncQueueItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        retryCount: 0,
      };

      setSyncQueue(prev => [...prev, newItem]);
      setState(prev => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1,
      }));

      if (state.isOnline) {
        syncData();
      }
    },
    [state.isOnline, setSyncQueue]
  );

  // Process sync queue
  const processSyncQueue = async () => {
    const item = syncQueue[0];
    if (!item) return;

    try {
      const response = await fetch(`/api/${item.endpoint}`, {
        method: item.action === 'delete' ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(item.data),
      });

      if (!response.ok) throw new Error('Sync failed');

      // Remove successfully synced item
      setSyncQueue(prev => prev.slice(1));
      setState(prev => ({
        ...prev,
        pendingChanges: prev.pendingChanges - 1,
      }));
    } catch (error) {
      if (item.retryCount < (retryAttempts || 3)) {
        // Retry later
        setSyncQueue(prev => [
          {
            ...item,
            retryCount: item.retryCount + 1,
          },
          ...prev.slice(1),
        ]);
        throw error;
      } else {
        // Remove failed item after max retries
        setSyncQueue(prev => prev.slice(1));
        setState(prev => ({
          ...prev,
          pendingChanges: prev.pendingChanges - 1,
          syncErrors: [...prev.syncErrors, error as Error],
        }));
        onSyncError?.(error as Error);
      }
    }
  };

  // Sync data
  const syncData = useCallback(async () => {
    if (state.isSyncing || !state.isOnline || syncQueue.length === 0) return;

    setState(prev => ({ ...prev, isSyncing: true }));
    onSyncStart?.();

    try {
      while (syncQueue.length > 0) {
        await processSyncQueue();
      }

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        syncErrors: [],
      }));
      onSyncComplete?.();
    } catch (error) {
      setTimeout(syncData, retryDelay);
    }
  }, [
    state.isSyncing,
    state.isOnline,
    syncQueue,
    onSyncStart,
    onSyncComplete,
    retryDelay,
  ]);

  // Set up periodic sync
  useEffect(() => {
    if (!syncInterval) return;

    syncTimeoutRef.current = setInterval(syncData, syncInterval);

    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [syncInterval, syncData]);

  // Initialize WebSocket when online
  useEffect(() => {
    if (state.isOnline) {
      initializeWebSocket();
    }

    return () => {
      wsRef.current?.close();
    };
  }, [state.isOnline, initializeWebSocket]);

  return {
    ...state,
    addToSyncQueue,
    syncData,
    syncQueue,
    clearSyncQueue: useCallback(() => {
      setSyncQueue([]);
      setState(prev => ({ ...prev, pendingChanges: 0 }));
    }, [setSyncQueue]),
    clearSyncErrors: useCallback(() => {
      setState(prev => ({ ...prev, syncErrors: [] }));
    }, []),
  };
};

export default useSync;
