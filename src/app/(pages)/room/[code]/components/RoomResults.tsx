'use client';

import { Award, CheckCircle2, Home, Target, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { RoomSnapshot } from '../types';
import { displayName, formatScore } from '../utils/roomHelpers';
import RoomScoreboard from './RoomScoreboard';

interface RoomResultsProps {
  room: RoomSnapshot;
  onBack: () => void;
  onLeave: () => void;
}

export default function RoomResults({ room, onBack, onLeave }: RoomResultsProps) {
  const summary = room.teamSummary;
  const accuracy = Math.round((summary?.accuracy ?? 0) * 100);

  return (
    <div className="space-y-4">
      <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-800">
            <Award className="h-5 w-5 text-amber-500" />
            Resultados de la partida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-cyan-50 p-3 text-center">
              <Target className="mx-auto h-5 w-5 text-cyan-600" />
              <p className="mt-1 text-xl font-bold text-cyan-800">{accuracy}%</p>
              <p className="text-xs text-gray-500">Precisión del equipo</p>
            </div>
            <div className="rounded-lg bg-teal-50 p-3 text-center">
              <CheckCircle2 className="mx-auto h-5 w-5 text-teal-600" />
              <p className="mt-1 text-xl font-bold text-teal-800">
                {summary?.totalCorrect ?? 0}
              </p>
              <p className="text-xs text-gray-500">Aciertos</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <Users className="mx-auto h-5 w-5 text-amber-600" />
              <p className="mt-1 text-xl font-bold text-amber-800">
                {summary?.participants ?? 0}
              </p>
              <p className="text-xs text-gray-500">Participantes</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <Award className="mx-auto h-5 w-5 text-purple-600" />
              <p className="mt-1 truncate text-sm font-bold text-purple-800">
                {summary?.bestPlayer
                  ? displayName(summary.bestPlayer)
                  : '—'}
              </p>
              <p className="text-xs text-gray-500">
                Mejor jugador
                {summary?.bestPlayer ? ` · ${formatScore(summary.bestPlayer.score)} pts` : ''}
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            El equipo acertó {summary?.totalCorrect ?? 0} de {summary?.totalAnswers ?? 0}{' '}
            respuestas enviadas en {room.questionCount} preguntas.
          </p>

          <RoomScoreboard
            players={room.players}
            meId={room.me?.userId}
            title="Tabla final"
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
              onClick={onLeave}
            >
              Salir de la sala
            </Button>
            <Button type="button" onClick={onBack}>
              <Home className="mr-2 h-4 w-4" />
              Volver a mis temas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
