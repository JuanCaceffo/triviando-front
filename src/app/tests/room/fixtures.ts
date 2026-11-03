import {
  RoomLetter,
  RoomPlayer,
  RoomQuestion,
  RoomSnapshot,
} from '@/app/(pages)/room/[code]/types';

export const makePlayer = (overrides: Partial<RoomPlayer> = {}): RoomPlayer => ({
  userId: 2,
  username: 'guest',
  name: 'Guest User',
  score: 0,
  correctCount: 0,
  totalResponseMs: 0,
  answeredCurrent: false,
  host: false,
  left: false,
  connected: true,
  rank: 2,
  ...overrides,
});

export const makeQuestion = (overrides: Partial<RoomQuestion> = {}): RoomQuestion => ({
  id: 10,
  number: 1,
  text: '¿Cuál es la capital de Francia?',
  options: [
    { letter: 'A', text: 'París' },
    { letter: 'B', text: 'Londres' },
    { letter: 'C', text: 'Roma' },
    { letter: 'D', text: 'Madrid' },
  ],
  ...overrides,
});

export const makeRoom = (overrides: Partial<RoomSnapshot> = {}): RoomSnapshot => ({
  code: 'ABC123',
  status: 'LOBBY',
  topic: 'Historia',
  source: 'TOPIC',
  host: { userId: 1, username: 'host', name: 'Host User' },
  players: [
    makePlayer({ userId: 1, username: 'host', name: 'Host User', host: true, rank: 1 }),
    makePlayer(),
  ],
  maxPlayers: 40,
  questionCount: 10,
  roundSeconds: 30,
  revealSeconds: 8,
  serverTimeEpochMs: 1_700_000_000_000,
  me: {
    userId: 2,
    host: false,
    answeredCurrent: false,
    rank: 2,
  },
  ...overrides,
});

export const makeAnswer = (letter: RoomLetter) => ({
  accepted: true,
  option: letter,
  answeredAtEpochMs: 1_700_000_000_000,
});
