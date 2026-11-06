'use client';

import { CheckCircle2, Loader2, X } from 'lucide-react';
import { cn } from '@/app/utils/utils';

export type QuizOptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'muted';

interface QuizOptionButtonProps {
  letter: string;
  text: string;
  state?: QuizOptionState;
  checked?: boolean;
  pending?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

const stateClass: Record<QuizOptionState, string> = {
  idle: 'border-cyan-100 bg-white hover:border-cyan-400 hover:bg-cyan-50',
  selected: 'border-cyan-500 bg-cyan-50',
  correct: 'border-green-500 bg-green-50',
  incorrect: 'border-red-400 bg-red-50',
  muted: 'border-cyan-100 bg-white opacity-60',
};

export default function QuizOptionButton({
  letter,
  text,
  state = 'idle',
  checked,
  pending = false,
  disabled = false,
  onSelect,
}: QuizOptionButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked ?? state === 'selected'}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg border-2 p-4 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
        stateClass[state],
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">
          {letter}
        </span>
        <span className="text-sm text-gray-800">{text}</span>
      </span>
      {pending && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cyan-600" />}
      {state === 'correct' && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />}
      {state === 'incorrect' && <X className="h-5 w-5 shrink-0 text-red-500" />}
    </button>
  );
}
