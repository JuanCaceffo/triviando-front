export type RoomStatus =
  | 'PREPARING'
  | 'LOBBY'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CLOSED'
  | 'FAILED';

export type RoomSource = 'TOPIC' | 'FILE';
export type RoomLetter = 'A' | 'B' | 'C' | 'D' | 'E';
export type RoomJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface RoomOption {
  letter: RoomLetter;
  text: string;
}

export interface RoomQuestion {
  id: number;
  number: number;
  text: string;
  options: RoomOption[];
  correctOptionLetter?: RoomLetter;
  correctOptionText?: string;
  explanation?: string;
}

export interface RoomHost {
  userId: number;
  username: string;
  name: string;
}

export interface RoomPlayer {
  userId: number;
  username: string;
  name: string;
  score: number;
  correctCount: number;
  totalResponseMs: number;
  answeredCurrent: boolean;
  host: boolean;
  left: boolean;
  connected: boolean;
  pointsLastRound?: number;
  correctLastRound?: boolean;
  rank: number;
}

export interface RoomGeneration {
  status: RoomJobStatus;
  progress: number;
  error?: string;
}

export interface RoomMe {
  userId: number;
  host: boolean;
  answeredCurrent: boolean;
  selectedOption?: RoomLetter;
  pointsLastRound?: number;
  correctLastRound?: boolean;
  rank: number;
}

export interface RoomTeamSummary {
  totalCorrect: number;
  totalAnswers: number;
  totalQuestions: number;
  participants: number;
  accuracy: number;
  bestPlayer?: RoomPlayer;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  topic: string;
  source: RoomSource;
  host: RoomHost;
  players: RoomPlayer[];
  maxPlayers: number;
  questionCount: number;
  roundSeconds: number;
  revealSeconds: number;
  currentQuestionNumber?: number;
  currentQuestion?: RoomQuestion;
  questionDeadlineEpochMs?: number;
  revealUntilEpochMs?: number;
  serverTimeEpochMs: number;
  generation?: RoomGeneration;
  me: RoomMe;
  teamSummary?: RoomTeamSummary;
  closeReason?: string;
}

export interface RoomCreated {
  code: string;
  status: RoomStatus;
}

export interface AnswerAck {
  accepted: boolean;
  option: RoomLetter;
  answeredAtEpochMs: number;
}

export interface RoomReactionEvent {
  userId: number;
  username: string;
  emoji: string;
  sentAtEpochMs: number;
}

export type RoomConnectionState = 'connecting' | 'open' | 'reconnecting' | 'closed';

export const ROOM_REACTION_EMOJIS = ['👍', '😂', '🔥', '😮', '🎉'] as const;
