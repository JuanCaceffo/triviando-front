'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Countdown basado en el deadline del servidor. El offset se recalcula con
 * cada snapshot para no depender del reloj del dispositivo.
 */
export function useServerCountdown(
  deadlineEpochMs: number | undefined,
  serverTimeEpochMs: number | undefined,
  roundSeconds: number,
) {
  const offsetRef = useRef(0);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (serverTimeEpochMs) {
      offsetRef.current = serverTimeEpochMs - Date.now();
    }
  }, [serverTimeEpochMs]);

  useEffect(() => {
    if (!deadlineEpochMs) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      setRemainingMs(Math.max(0, deadlineEpochMs - (Date.now() + offsetRef.current)));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [deadlineEpochMs]);

  const totalMs = Math.max(1, roundSeconds * 1000);
  return {
    remainingMs,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    progress: Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)),
    isExpired: deadlineEpochMs !== undefined && remainingMs <= 0,
  };
}
