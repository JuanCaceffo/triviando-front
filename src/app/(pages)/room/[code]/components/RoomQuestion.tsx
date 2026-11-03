'use client';

import { CheckCircle2, Clock, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { RoomLetter, RoomSnapshot } from '../types';
import {
  activePlayers,
  answeredCount,
  isReveal,
} from '../utils/roomHelpers';
import RoomReactions, { RoomReactionItem } from './RoomReactions';
import RoomScoreboard from './RoomScoreboard';

interface RoomQuestionProps {
  room: RoomSnapshot;
  remainingSeconds: number;
  timerProgress: number;
  isExpired: boolean;
  selectedOption?: RoomLetter;
  submitting: boolean;
  onAnswer: (letter: RoomLetter) => void;
  onReact: (emoji: string) => void;
  reactions: RoomReactionItem[];
}

const timerColor = (progress: number) => {
  if (progress > 50) return 'bg-cyan-500';
  if (progress > 20) return 'bg-amber-500';
  return 'bg-red-500';
};

export default function RoomQuestion({
  room,
  remainingSeconds,
  timerProgress,
  isExpired,
  selectedOption,
  submitting,
  onAnswer,
  onReact,
  reactions,
}: RoomQuestionProps) {
  const question = room.currentQuestion;
  const reveal = isReveal(room);
  const myOption = room.me?.selectedOption ?? selectedOption;
  const hasAnswered = Boolean(room.me?.answeredCurrent);
  const totalActive = activePlayers(room.players).length;
  const answeredTotal = answeredCount(room.players);
  const disabled = reveal || hasAnswered || submitting || isExpired;

  if (!question) {
    return (
      <Card className="border-0 bg-white/95 shadow-xl">
        <CardContent className="flex items-center justify-center gap-2 py-16 text-cyan-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando pregunta…
        </CardContent>
      </Card>
    );
  }

  const optionClass = (letter: RoomLetter) => {
    const base =
      'flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-all';
    if (reveal) {
      if (letter === question.correctOptionLetter) {
        return `${base} border-green-500 bg-green-50`;
      }
      if (letter === myOption) {
        return `${base} border-red-400 bg-red-50`;
      }
      return `${base} border-gray-200 bg-white opacity-60`;
    }
    if (letter === myOption) {
      return `${base} border-cyan-500 bg-cyan-50`;
    }
    if (disabled) {
      return `${base} border-cyan-100 bg-white opacity-60`;
    }
    return `${base} border-cyan-100 bg-white hover:border-cyan-400 hover:bg-cyan-50`;
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader>
          {!reveal && (
            <>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-cyan-800">
                <span>
                  Pregunta {question.number} de {room.questionCount}
                </span>
                <span className="flex items-center gap-1" aria-live="polite">
                  <Clock className="h-4 w-4" />
                  {remainingSeconds}s
                </span>
              </div>
              <Progress
                value={timerProgress}
                className="h-2 bg-cyan-100"
                indicatorClassName={timerColor(timerProgress)}
              />
            </>
          )}
          <CardTitle className="mt-4 text-xl leading-snug text-gray-900">
            {question.text}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
            {question.options.map((option) => (
              <button
                key={option.letter}
                type="button"
                role="radio"
                aria-checked={myOption === option.letter}
                disabled={disabled}
                onClick={() => onAnswer(option.letter)}
                className={optionClass(option.letter)}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">
                    {option.letter}
                  </span>
                  <span className="text-sm text-gray-800">{option.text}</span>
                </span>
                {submitting && myOption === option.letter && (
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
                )}
                {reveal && option.letter === question.correctOptionLetter && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {reveal && option.letter === myOption && option.letter !== question.correctOptionLetter && (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </button>
            ))}
          </div>

          {!reveal && (
            <p className="text-center text-xs text-gray-500">
              {hasAnswered
                ? 'Respuesta enviada. Esperando a los demás…'
                : isExpired
                  ? 'Tiempo agotado. Esperando el cierre de la ronda…'
                  : `${answeredTotal} de ${totalActive} respondieron`}
            </p>
          )}

          {reveal && (
            <div className="space-y-3" aria-live="polite">
              {room.me?.pointsLastRound !== undefined && (
                <p
                  className={`text-center text-lg font-bold ${
                    room.me.correctLastRound ? 'text-teal-600' : 'text-gray-500'
                  }`}
                >
                  {room.me.correctLastRound
                    ? `¡Correcto! +${room.me.pointsLastRound} puntos`
                    : 'Esta vez no fue correcta'}
                </p>
              )}
              {question.explanation && (
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
                  <p className="font-semibold">¿Por qué?</p>
                  <p className="mt-1 whitespace-pre-line">{question.explanation}</p>
                </div>
              )}
              <RoomScoreboard
                players={room.players}
                meId={room.me?.userId}
                reveal
                title="Puntajes de la ronda"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <RoomReactions reactions={reactions} onReact={onReact} disabled={reveal} />
    </div>
  );
}
