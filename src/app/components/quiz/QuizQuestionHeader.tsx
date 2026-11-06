'use client';

import { Clock } from 'lucide-react';

interface QuizQuestionHeaderProps {
  current: number;
  total: number;
  secondsLeft?: number;
}

export default function QuizQuestionHeader({
  current,
  total,
  secondsLeft,
}: QuizQuestionHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between text-sm font-medium text-cyan-800">
      <span>
        Pregunta {current} de {total}
      </span>
      {secondsLeft !== undefined && (
        <span className="flex items-center gap-1" aria-live="polite">
          <Clock className="h-4 w-4" />
          {secondsLeft}s
        </span>
      )}
    </div>
  );
}
