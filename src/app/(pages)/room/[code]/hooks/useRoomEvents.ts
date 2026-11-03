'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthToken } from '@/app/services/baseService';
import { roomService } from '@/app/services/roomService';
import {
  RoomConnectionState,
  RoomReactionEvent,
  RoomSnapshot,
} from '../types';
import { parseSseBuffer } from '../utils/sse';

interface UseRoomEventsOptions {
  code: string;
  enabled: boolean;
  onSnapshot: (snapshot: RoomSnapshot) => void;
  onReaction?: (reaction: RoomReactionEvent) => void;
  onClosed?: (reason: string) => void;
  onError?: (message: string) => void;
}

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000];

export function useRoomEvents({
  code,
  enabled,
  onSnapshot,
  onReaction,
  onClosed,
  onError,
}: UseRoomEventsOptions) {
  const [connectionState, setConnectionState] =
    useState<RoomConnectionState>('connecting');
  const [retryKey, setRetryKey] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const callbacks = useRef({ onSnapshot, onReaction, onClosed, onError });
  useEffect(() => {
    callbacks.current = { onSnapshot, onReaction, onClosed, onError };
  }, [onSnapshot, onReaction, onClosed, onError]);

  const reconnect = useCallback(() => {
    setRetryKey((value) => value + 1);
  }, []);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    let stopped = false;
    let closedByServer = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const redirectToLogin = () => {
      if (typeof window !== 'undefined') {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
    };

    const dispatch = (eventName: string, data: string) => {
      try {
        if (eventName === 'snapshot') {
          callbacks.current.onSnapshot(JSON.parse(data) as RoomSnapshot);
        } else if (eventName === 'reaction' && callbacks.current.onReaction) {
          callbacks.current.onReaction(JSON.parse(data) as RoomReactionEvent);
        } else if (eventName === 'closed') {
          const payload = JSON.parse(data) as { reason?: string };
          closedByServer = true;
          setConnectionState('closed');
          callbacks.current.onClosed?.(payload.reason ?? 'CLOSED');
        }
      } catch {
        callbacks.current.onError?.('No se pudo interpretar un evento de la sala.');
      }
    };

    const connect = async () => {
      setConnectionState(attempt === 0 ? 'connecting' : 'reconnecting');
      const token = getAuthToken();
      if (!token) {
        redirectToLogin();
        return;
      }

      try {
        const response = await fetch(roomService.getEventsUrl(code), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        if (response.status === 403 || response.status === 404) {
          closedByServer = true;
          setConnectionState('closed');
          callbacks.current.onError?.(
            response.status === 403
              ? 'No participás de esta sala.'
              : 'La sala ya no existe.',
          );
          return;
        }
        if (!response.ok || !response.body) {
          throw new Error(`SSE ${response.status}`);
        }

        attempt = 0;
        setConnectionState('open');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!stopped && !closedByServer) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseBuffer(buffer);
          buffer = parsed.remainder;
          for (const event of parsed.events) {
            dispatch(event.event, event.data);
          }
        }
        await reader.cancel().catch(() => undefined);
      } catch (error) {
        if (stopped || controller.signal.aborted || closedByServer) {
          return;
        }
        callbacks.current.onError?.(
          error instanceof Error ? error.message : 'Se perdió la conexión con la sala.',
        );
      }

      if (!stopped && !closedByServer) {
        const delay =
          RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)];
        attempt += 1;
        setConnectionState('reconnecting');
        reconnectTimer = setTimeout(connect, delay);
      }
    };

    connect();

    return () => {
      stopped = true;
      controller.abort();
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [code, enabled, retryKey]);

  return { connectionState, reconnect, stop };
}
