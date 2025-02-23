import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

type MessageHandler = (data: any) => void;
type ErrorHandler = (error: Event) => void;

interface WebSocketOptions {
  url: string;
  autoConnect?: boolean;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: ErrorHandler;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
}

const defaultOptions: Partial<WebSocketOptions> = {
  autoConnect: true,
  autoReconnect: true,
  reconnectAttempts: 5,
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
};

export const useWebSocket = (options: WebSocketOptions) => {
  const {
    url,
    autoConnect,
    autoReconnect,
    reconnectAttempts,
    reconnectInterval,
    heartbeatInterval,
    onOpen,
    onClose,
    onError,
  } = { ...defaultOptions, ...options };

  const { user } = useAuth();
  const notify = useNotification();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const messageHandlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) return;

    try {
      setIsConnecting(true);
      setError(null);

      const ws = new WebSocket(url);

      ws.onopen = () => {
        wsRef.current = ws;
        setIsConnected(true);
        setIsConnecting(false);
        reconnectCountRef.current = 0;
        onOpen?.();

        // Send authentication message if user is logged in
        if (user?.token) {
          send('auth', { token: user.token });
        }

        // Start heartbeat
        if (heartbeatInterval) {
          heartbeatIntervalRef.current = setInterval(() => {
            send('ping');
          }, heartbeatInterval);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
        onClose?.();

        // Clear heartbeat interval
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt reconnection if enabled
        if (autoReconnect && reconnectCountRef.current < (reconnectAttempts || 0)) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, reconnectInterval);
        } else if (reconnectCountRef.current >= (reconnectAttempts || 0)) {
          notify.error('WebSocket connection failed after multiple attempts');
        }
      };

      ws.onerror = (event) => {
        setError(event);
        onError?.(event);
        notify.error('WebSocket connection error');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const handlers = messageHandlersRef.current.get(message.type);
          
          if (handlers) {
            handlers.forEach(handler => handler(message.payload));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      setIsConnecting(false);
      setError(error as Event);
      onError?.(error as Event);
      notify.error('Failed to establish WebSocket connection');
    }
  }, [url, user, autoReconnect, reconnectAttempts, reconnectInterval, heartbeatInterval, onOpen, onClose, onError, notify]);

  // Send message through WebSocket
  const send = useCallback((type: string, payload?: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return false;
    }

    try {
      const message: WebSocketMessage = { type, payload };
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }, []);

  // Subscribe to message type
  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set());
    }
    messageHandlersRef.current.get(type)?.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = messageHandlersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          messageHandlersRef.current.delete(type);
        }
      }
    };
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setIsConnected(false);
    setIsConnecting(false);
    reconnectCountRef.current = 0;
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Reconnect when user auth changes
  useEffect(() => {
    if (user?.token && !isConnected && !isConnecting) {
      connect();
    }
  }, [user, isConnected, isConnecting, connect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    send,
    subscribe,
  };
};

export default useWebSocket;
