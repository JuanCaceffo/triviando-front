import { act, renderHook } from '@testing-library/react';
import { useServerCountdown } from '@/app/(pages)/room/[code]/hooks/useServerCountdown';

describe('useServerCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('descuenta el tiempo usando el deadline del servidor', () => {
    const now = Date.now();
    const { result } = renderHook(() =>
      useServerCountdown(now + 5_000, now, 30),
    );

    expect(result.current.remainingSeconds).toBe(5);
    expect(result.current.progress).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(2_000);
    });
    expect(result.current.remainingSeconds).toBe(3);

    act(() => {
      jest.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it('sin deadline queda en cero y no vencido', () => {
    const { result } = renderHook(() => useServerCountdown(undefined, Date.now(), 30));
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.isExpired).toBe(false);
  });
});
