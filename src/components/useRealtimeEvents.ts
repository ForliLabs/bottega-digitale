"use client";

// useRealtimeEvents — React hook for SSE dashboard updates
// Manages SSE connection lifecycle with graceful polling fallback

import { useEffect, useRef, useCallback, useState } from "react";
import type { RealtimeEventType } from "@/lib/realtime";
import { RECONNECT_DELAY_MS, MAX_RECONNECT_ATTEMPTS } from "@/lib/realtime";

export interface RealtimeEventData {
  type: RealtimeEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface UseRealtimeEventsOptions {
  enabled?: boolean;
  eventTypes?: RealtimeEventType[];
  pollingFallbackMs?: number;
}

export function useRealtimeEvents(
  onEvent: (event: RealtimeEventData) => void,
  options: UseRealtimeEventsOptions = {},
) {
  const { enabled = true, eventTypes, pollingFallbackMs = 30_000 } = options;
  const [connected, setConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"sse" | "polling" | "disconnected">("disconnected");
  const reconnectAttempts = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const handleMessage = useCallback(
    (messageEvent: MessageEvent) => {
      try {
        const event: RealtimeEventData = JSON.parse(messageEvent.data);
        if (event.type === "connected" as RealtimeEventType) return;
        if (eventTypes && !eventTypes.includes(event.type)) return;
        onEventRef.current(event);
      } catch {
        // Ignore heartbeats and malformed messages
      }
    },
    [eventTypes],
  );

  useEffect(() => {
    if (!enabled) return;

    // Check if SSE is supported
    if (typeof EventSource === "undefined") {
      const modeTimeout = window.setTimeout(() => {
        setConnectionMode("polling");
      }, 0);

      // Polling fallback
      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/notifications?limit=5");
          if (res.ok) {
            const data = await res.json();
            if (data.notifications?.length) {
              for (const n of data.notifications) {
                onEventRef.current({
                  type: "notification:new",
                  data: n,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
        } catch {
          // Ignore polling errors
        }
      }, pollingFallbackMs);

      return () => {
        window.clearTimeout(modeTimeout);
        clearInterval(interval);
      };
    }

    // SSE connection
    function connect() {
      const es = new EventSource("/api/events/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
        setConnectionMode("sse");
        reconnectAttempts.current = 0;
      };

      es.onmessage = handleMessage;

      es.onerror = () => {
        setConnected(false);
        es.close();
        eventSourceRef.current = null;

        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          const delay = RECONNECT_DELAY_MS * Math.min(reconnectAttempts.current, 5);
          setTimeout(connect, delay);
        } else {
          setConnectionMode("polling");
        }
      };
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, handleMessage, pollingFallbackMs]);

  return { connected, connectionMode };
}
