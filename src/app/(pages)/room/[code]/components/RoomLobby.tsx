'use client';

import { Play, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { RoomSnapshot } from '../types';
import { canStart } from '../utils/roomHelpers';
import RoomPlayerList from './RoomPlayerList';

interface RoomLobbyProps {
  room: RoomSnapshot;
  isHost: boolean;
  starting: boolean;
  onStart: () => void;
}

export default function RoomLobby({ room, isHost, starting, onStart }: RoomLobbyProps) {
  const active = room.players.filter((player) => !player.left).length;
  const ready = canStart(room);
  const missing = Math.max(0, 2 - active);

  return (
    <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-800">
          <Users className="h-5 w-5 text-teal-500" />
          Sala de espera
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Compartí el código <span className="font-mono font-bold text-cyan-700">{room.code}</span>{' '}
          o el link. La partida empieza cuando el anfitrión presione Iniciar.
        </p>

        <RoomPlayerList
          players={room.players}
          maxPlayers={room.maxPlayers}
          meId={room.me?.userId}
        />

        {isHost ? (
          <div className="flex flex-col items-end gap-2">
            {missing > 0 && (
              <p className="text-xs text-amber-600">
                Faltan {missing} jugador{missing === 1 ? '' : 'es'} para poder iniciar.
              </p>
            )}
            <Button type="button" onClick={onStart} disabled={!ready || starting} loading={starting}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar partida
            </Button>
          </div>
        ) : (
          <p className="rounded-lg bg-cyan-50 px-3 py-2 text-center text-sm text-cyan-800">
            Esperando que el anfitrión inicie la partida…
          </p>
        )}
      </CardContent>
    </Card>
  );
}
