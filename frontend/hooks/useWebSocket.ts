"use client";
import { useEffect, useRef, useCallback } from "react";
import { WS_URL } from "@/lib/api";

interface UseWebSocketOptions {
  onMessage: (msg: any) => void;
  onError?: () => void;
}

export function useWebSocket({ onMessage, onError }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          onMessage(msg);
        } catch {}
      };

      ws.onerror = () => {
        onError?.();
      };

      ws.onclose = () => {
        // Reconnect after 5 seconds
        reconnectTimer.current = setTimeout(connect, 5000);
      };

      // Heartbeat ping every 25 seconds
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);

      ws.onclose = () => {
        clearInterval(pingInterval);
        reconnectTimer.current = setTimeout(connect, 5000);
      };
    } catch {
      onError?.();
    }
  }, [onMessage, onError]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
}
