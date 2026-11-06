'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import QuizTimerBar from './quiz/QuizTimerBar';

export type TimerHandle = {
  stop: () => void;
  start: () => void;
  getElapsedTime: () => number;
};

const TOTAL_SECONDS = 50;

interface TimerProps {
  onTick?: (remainingSeconds: number, progress: number) => void;
}

const Timer = forwardRef<TimerHandle, TimerProps>(({ onTick }, ref) => {
  const [progress, setProgress] = useState(100);
  const progressRef = useRef(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const applyProgress = (next: number) => {
    progressRef.current = next;
    setProgress(next);
    onTickRef.current?.(Math.ceil((next / 100) * TOTAL_SECONDS), next);
  };

  const startTimer = () => {
    if (!intervalRef.current) {
      applyProgress(100);
      const intervalTime = 1000;
      const decrement = 100 / TOTAL_SECONDS;

      // Marca de tiempo al iniciar
      startTimeRef.current = Date.now();
      elapsedTimeRef.current = 0;

      intervalRef.current = setInterval(() => {
        applyProgress(Math.max(progressRef.current - decrement, 0));
      }, intervalTime);
    }
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      // Calcula el tiempo transcurrido
      if (startTimeRef.current) {
        elapsedTimeRef.current = Date.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
    }
  };

  const getElapsedTime = () => {
    return elapsedTimeRef.current; // Devuelve el tiempo transcurrido en milisegundos
  };

  useImperativeHandle(ref, () => ({
    start: startTimer,
    stop: stopTimer,
    getElapsedTime,
  }));

  useEffect(
    () => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    [],
  );

  return <QuizTimerBar value={progress} />;
});

Timer.displayName = 'Timer';

export default Timer;
