'use client';

import { Copy, LogOut, Share2, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { RoomConnectionState, RoomSnapshot } from '../types';
import { STATUS_LABELS } from '../utils/roomHelpers';

interface RoomHeaderProps {
  room: RoomSnapshot;
  connectionState: RoomConnectionState;
  onCopyCode: () => void;
  onCopyLink: () => void;
  onLeave: () => void;
  onClose: () => void;
}

const connectionLabel: Record<RoomConnectionState, string> = {
  connecting: 'Conectando…',
  open: 'En vivo',
  reconnecting: 'Reconectando…',
  closed: 'Desconectado',
};

export default function RoomHeader({
  room,
  connectionState,
  onCopyCode,
  onCopyLink,
  onLeave,
  onClose,
}: RoomHeaderProps) {
  return (
    <header className="mb-4 flex flex-col gap-3 rounded-xl bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
            {STATUS_LABELS[room.status]}
          </span>
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              connectionState === 'open' ? 'text-teal-600' : 'text-amber-600'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connectionState === 'open' ? 'bg-teal-500' : 'bg-amber-500'
              }`}
            />
            {connectionLabel[connectionState]}
          </span>
        </div>
        <h1 className="mt-1 truncate text-xl font-bold text-cyan-800">{room.topic}</h1>
        <p className="text-sm text-gray-500">
          Código <span className="font-mono font-bold tracking-widest text-cyan-700">{room.code}</span>
          {' · '}
          {room.players.filter((player) => !player.left).length}/{room.maxPlayers} jugadores
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCopyCode}>
          <Copy className="mr-1 h-4 w-4" />
          Código
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCopyLink}>
          <Share2 className="mr-1 h-4 w-4" />
          Link
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onLeave}>
          <LogOut className="mr-1 h-4 w-4" />
          Salir
        </Button>
        {room.me?.host && room.status !== 'FINISHED' && (
          <Button type="button" variant="destructive" size="sm" onClick={onClose}>
            <X className="mr-1 h-4 w-4" />
            Cerrar
          </Button>
        )}
      </div>
    </header>
  );
}
