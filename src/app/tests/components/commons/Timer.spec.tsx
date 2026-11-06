import Timer, { TimerHandle } from '@/app/components/Timer';
import { render, act } from '@testing-library/react';
import { useEffect, useRef } from 'react';

describe('Timer component', () => {
  jest.useFakeTimers();

  it('should render the progress bar with 100% initial progress', () => {
    const { container } = render(<Timer />);

    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).toBeInTheDocument();

    const indicator = bar?.firstElementChild as HTMLElement;
    expect(indicator.style.width).toBe('100%'); // 100% progreso
  });

  const TimerWithRef = ({
    refCallback,
    onTick,
  }: {
    refCallback: (ref: TimerHandle) => void;
    onTick?: (remainingSeconds: number, progress: number) => void;
  }) => {
    const timerRef = useRef<TimerHandle>(null);

    useEffect(() => {
      if (timerRef.current) {
        refCallback(timerRef.current);
      }
    });

    return <Timer ref={timerRef} onTick={onTick} />;
  };

  it('should start, progress, stop and get elapsed time correctly', async () => {
    let ref: TimerHandle | null = null;

    render(<TimerWithRef refCallback={(r) => (ref = r)} />);
    await act(async () => {}); // da tiempo al efecto

    expect(ref).not.toBeNull();

    act(() => {
      ref!.start();
    });

    act(() => {
      jest.advanceTimersByTime(3000); // 3 segundos simulados
    });

    act(() => {
      ref!.stop();
    });

    const elapsed = ref!.getElapsedTime();
    expect(elapsed).toBeGreaterThanOrEqual(3000);
    expect(elapsed).toBeLessThan(3500);
  });

  it('should report the remaining seconds and progress on every tick', async () => {
    const onTick = jest.fn();
    let ref: TimerHandle | null = null;

    render(<TimerWithRef refCallback={(r) => (ref = r)} onTick={onTick} />);
    await act(async () => {});

    act(() => {
      ref!.start();
    });

    expect(onTick).toHaveBeenCalledWith(50, 100);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onTick).toHaveBeenLastCalledWith(47, 94);

    act(() => {
      ref!.stop();
    });
  });
});
