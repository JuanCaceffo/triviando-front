'use client';

import { Crown } from 'lucide-react';
import { RoomPlayer } from '../types';
import { displayName, formatScore, initials } from '../utils/roomHelpers';

interface RoomScoreboardProps {
  players: RoomPlayer[];
  meId?: number;
  reveal?: boolean;
  title?: string;
}

export default function RoomScoreboard({
  players,
  meId,
  reveal = false,
  title = 'Tabla de posiciones',
}: RoomScoreboardProps) {
  return (
    <div className="rounded-lg border border-cyan-100 bg-white/90">
      <div className="flex items-center justify-between border-b border-cyan-100 px-3 py-2">
        <h3 className="text-sm font-semibold text-cyan-800">{title}</h3>
        <span className="text-xs text-gray-500">{players.length} jugadores</span>
      </div>
      <ul className="max-h-64 overflow-y-auto" aria-label={title}>
        {players.map((player) => (
          <li
            key={player.userId}
            className={`flex items-center gap-2 border-b border-cyan-50 px-3 py-2 last:border-b-0 ${
              player.userId === meId ? 'bg-cyan-50' : ''
            } ${player.left ? 'opacity-50' : ''}`}
          >
            <span className="w-6 text-center text-xs font-bold text-cyan-700">
              {player.rank}
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-[10px] font-bold text-white">
              {initials(player.name, player.username)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
              {displayName(player)}
              {player.host && <Crown className="ml-1 inline h-3.5 w-3.5 text-amber-500" />}
              {player.left && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-gray-500">
                  Salió
                </span>
              )}
            </span>
            {reveal && player.pointsLastRound !== undefined && (
              <span
                className={`text-xs font-semibold ${
                  player.correctLastRound ? 'text-teal-600' : 'text-gray-400'
                }`}
              >
                {player.correctLastRound ? `+${player.pointsLastRound}` : '+0'}
              </span>
            )}
            <span className="w-12 text-right text-sm font-bold text-cyan-700">
              {formatScore(player.score)}
            </span>
            <span className="hidden w-14 text-right text-xs text-gray-500 sm:block">
              {player.correctCount} aciertos
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
