'use client';

import { Progress } from '@/app/components/ui/progress';

export const timerColor = (progress: number) => {
  if (progress > 50) return 'bg-cyan-500';
  if (progress > 20) return 'bg-amber-500';
  return 'bg-red-500';
};

interface QuizTimerBarProps {
  value: number;
}

export default function QuizTimerBar({ value }: QuizTimerBarProps) {
  return (
    <Progress
      value={value}
      className="h-2 bg-cyan-100"
      indicatorClassName={timerColor(value)}
      aria-label="Tiempo restante"
    />
  );
}
