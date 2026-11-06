'use client';

import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import QuizQuestionHeader from '@/app/components/quiz/QuizQuestionHeader';
import QuizTimerBar from '@/app/components/quiz/QuizTimerBar';
import QuizOptionButton, { QuizOptionState } from '@/app/components/quiz/QuizOptionButton';
import { RoomLetter, RoomSnapshot } from '../types';
import { activePlayers, answeredCount, isReveal } from '../utils/roomHelpers';
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

  const optionState = (letter: RoomLetter): QuizOptionState => {
    if (reveal) {
      if (letter === question.correctOptionLetter) return 'correct';
      if (letter === myOption) return 'incorrect';
      return 'muted';
    }
    if (letter === myOption) return 'selected';
    if (disabled) return 'muted';
    return 'idle';
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader>
          {!reveal && (
            <>
              <QuizQuestionHeader
                current={question.number}
                total={room.questionCount}
                secondsLeft={remainingSeconds}
              />
              <QuizTimerBar value={timerProgress} />
            </>
          )}
          <CardTitle className="mt-4 text-xl leading-snug text-gray-900">
            {question.text}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
            {question.options.map((option) => (
              <QuizOptionButton
                key={option.letter}
                letter={option.letter}
                text={option.text}
                state={optionState(option.letter)}
                checked={myOption === option.letter}
                pending={submitting && myOption === option.letter}
                disabled={disabled}
                onSelect={() => onAnswer(option.letter)}
              />
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
