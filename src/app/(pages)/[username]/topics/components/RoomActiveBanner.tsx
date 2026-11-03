'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Radio, Trophy } from 'lucide-react';
import { roomService } from '@/app/services/roomService';
import { RoomSnapshot } from '@/app/(pages)/room/[code]/types';
import { STATUS_LABELS } from '@/app/(pages)/room/[code]/utils/roomHelpers';

const RoomActiveBanner = () => {
  const [room, setRoom] = useState<RoomSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    roomService
      .getActiveRoom()
      .then((active) => {
        if (!cancelled) setRoom(active);
      })
      .catch(() => {
        // El banner es informativo; no bloquea la página de temas.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!room) {
    return null;
  }

  const finished = room.status === 'FINISHED';

  return (
    <Link
      href={`/room/${room.code}`}
      className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-white/90 px-4 py-3 shadow-md backdrop-blur-sm transition hover:border-cyan-400 hover:shadow-lg"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white">
          {finished ? <Trophy className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-cyan-800">
            {finished ? 'Resultados de tu última sala' : 'Tenés una sala en curso'}
            <span className="ml-2 font-mono text-xs tracking-widest text-cyan-600">
              {room.code}
            </span>
          </p>
          <p className="truncate text-xs text-gray-500">
            {STATUS_LABELS[room.status]} · {room.topic} ·{' '}
            {room.players.filter((player) => !player.left).length} jugadores
          </p>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-cyan-700">
        {finished ? 'Ver resultados' : 'Volver'}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
};

export default RoomActiveBanner;
