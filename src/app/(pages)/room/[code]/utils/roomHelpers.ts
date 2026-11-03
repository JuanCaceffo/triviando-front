import { RoomPlayer, RoomSnapshot, RoomStatus } from '../types';

export const STATUS_LABELS: Record<RoomStatus, string> = {
  PREPARING: 'Preparando preguntas',
  LOBBY: 'Sala de espera',
  IN_PROGRESS: 'Partida en curso',
  FINISHED: 'Partida terminada',
  CLOSED: 'Sala cerrada',
  FAILED: 'No se pudo crear la partida',
};

export const initials = (name: string, username: string): string => {
  const source = (name || username || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

export const displayName = (player: Pick<RoomPlayer, 'name' | 'username'>): string =>
  player.name?.trim() || player.username || 'Jugador';

export const formatScore = (score: number): string => String(Math.max(0, score));

export const formatAverageTime = (totalMs: number, correct: number): string => {
  if (!correct) return '—';
  return `${(totalMs / correct / 1000).toFixed(1)}s`;
};

export const activePlayers = (players: RoomPlayer[]): RoomPlayer[] =>
  players.filter((player) => !player.left);

export const answeredCount = (players: RoomPlayer[]): number =>
  players.filter((player) => player.answeredCurrent && !player.left).length;

export const isReveal = (room: RoomSnapshot): boolean =>
  room.status === 'IN_PROGRESS' && Boolean(room.revealUntilEpochMs);

export const isTerminal = (room: RoomSnapshot): boolean =>
  room.status === 'CLOSED' || room.status === 'FAILED';

export const isHost = (room: RoomSnapshot): boolean => Boolean(room.me?.host);

export const canStart = (room: RoomSnapshot): boolean =>
  room.status === 'LOBBY' &&
  room.questionCount > 0 &&
  activePlayers(room.players).length >= 2;
