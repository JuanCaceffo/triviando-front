'use client';

import { Crown, Wifi, WifiOff } from 'lucide-react';
import { RoomPlayer } from '../types';
import { displayName, formatScore, initials } from '../utils/roomHelpers';

interface RoomPlayerListProps {
  players: RoomPlayer[];
  maxPlayers: number;
  meId?: number;
  showScore?: boolean;
}

export default function RoomPlayerList({
  players,
  maxPlayers,
  meId,
  showScore = false,
}: RoomPlayerListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-cyan-800">
        <span>Jugadores</span>
        <span className="font-medium">
          {players.filter((player) => !player.left).length}/{maxPlayers}
        </span>
      </div>
      <ul className="max-h-72 space-y-2 overflow-y-auto pr-1" aria-label="Jugadores de la sala">
        {players.map((player) => (
          <li
            key={player.userId}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
              player.userId === meId
                ? 'border-cyan-300 bg-cyan-50'
                : 'border-cyan-100 bg-white/80'
            } ${player.left ? 'opacity-50' : ''}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-white">
              {initials(player.name, player.username)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-medium text-gray-800">
                {displayName(player)}
                {player.host && <Crown className="h-3.5 w-3.5 text-amber-500" aria-label="Anfitrión" />}
              </p>
              <p className="truncate text-xs text-gray-500">@{player.username}</p>
            </div>
            {player.left && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                Salió
              </span>
            )}
            {showScore && (
              <div className="text-right">
                <p className="text-sm font-bold text-cyan-700">{formatScore(player.score)}</p>
                <p className="text-[10px] text-gray-500">
                  {player.correctCount} aciertos
                </p>
              </div>
            )}
            <span title={player.connected ? 'Conectado' : 'Desconectado'}>
              {player.connected ? (
                <Wifi className="h-4 w-4 text-teal-500" aria-label="Conectado" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" aria-label="Desconectado" />
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
