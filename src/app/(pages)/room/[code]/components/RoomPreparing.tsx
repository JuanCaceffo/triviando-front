'use client';

import { Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { RoomSnapshot } from '../types';
import RoomPlayerList from './RoomPlayerList';

interface RoomPreparingProps {
  room: RoomSnapshot;
  isHost: boolean;
  onCancel: () => void;
}

export default function RoomPreparing({ room, isHost, onCancel }: RoomPreparingProps) {
  const progress = room.generation?.progress ?? 0;
  const error = room.generation?.error;

  return (
    <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-800">
          <Sparkles className="h-5 w-5 text-teal-500" />
          Preparando las preguntas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-2xl text-white shadow-lg">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <p className="max-w-md text-sm text-gray-600">
            {error
              ? error
              : 'La IA está generando las preguntas de la sala. Podés compartir el código mientras esperamos.'}
          </p>
          {!error && (
            <div className="mt-5 w-full max-w-md">
              <Progress value={progress} className="h-2 bg-cyan-100" />
              <p className="mt-2 text-xs text-gray-500">{progress}%</p>
            </div>
          )}
        </div>

        <RoomPlayerList
          players={room.players}
          maxPlayers={room.maxPlayers}
          meId={room.me?.userId}
        />

        {isHost && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar sala
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
