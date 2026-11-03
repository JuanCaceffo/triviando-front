import {
  activePlayers,
  answeredCount,
  canStart,
  displayName,
  formatAverageTime,
  formatScore,
  initials,
  isHost,
  isReveal,
  isTerminal,
} from '@/app/(pages)/room/[code]/utils/roomHelpers';
import { makePlayer, makeRoom } from './fixtures';

describe('roomHelpers', () => {
  it('genera iniciales a partir del nombre o del username', () => {
    expect(initials('Host User', 'host')).toBe('HU');
    expect(initials('', 'guest')).toBe('GU');
    expect(initials('', '')).toBe('?');
  });

  it('usa el nombre visible y cae al username', () => {
    expect(displayName({ name: 'Host User', username: 'host' })).toBe('Host User');
    expect(displayName({ name: '   ', username: 'host' })).toBe('host');
    expect(displayName({ name: '', username: '' })).toBe('Jugador');
  });

  it('formatea puntajes y tiempos promedio', () => {
    expect(formatScore(-5)).toBe('0');
    expect(formatScore(120)).toBe('120');
    expect(formatAverageTime(0, 0)).toBe('—');
    expect(formatAverageTime(20_000, 2)).toBe('10.0s');
  });

  it('filtra jugadores activos y cuenta respuestas', () => {
    const players = [
      makePlayer({ userId: 1, answeredCurrent: true }),
      makePlayer({ userId: 2, answeredCurrent: false }),
      makePlayer({ userId: 3, left: true, answeredCurrent: true }),
    ];
    expect(activePlayers(players).map((player) => player.userId)).toEqual([1, 2]);
    expect(answeredCount(players)).toBe(1);
  });

  it('detecta reveal, estados terminales y anfitrión', () => {
    const reveal = makeRoom({ status: 'IN_PROGRESS', revealUntilEpochMs: 123 });
    expect(isReveal(reveal)).toBe(true);
    expect(isReveal(makeRoom({ status: 'LOBBY', revealUntilEpochMs: 123 }))).toBe(false);
    expect(isTerminal(makeRoom({ status: 'CLOSED' }))).toBe(true);
    expect(isTerminal(makeRoom({ status: 'FAILED' }))).toBe(true);
    expect(isTerminal(makeRoom({ status: 'LOBBY' }))).toBe(false);
    expect(isHost(makeRoom({ me: { ...makeRoom().me, host: true } }))).toBe(true);
  });

  it('solo permite iniciar en LOBBY con preguntas y dos jugadores', () => {
    expect(canStart(makeRoom())).toBe(true);
    expect(canStart(makeRoom({ players: [makePlayer({ userId: 1 })] }))).toBe(false);
    expect(canStart(makeRoom({ questionCount: 0 }))).toBe(false);
    expect(canStart(makeRoom({ status: 'PREPARING' }))).toBe(false);
  });
});
