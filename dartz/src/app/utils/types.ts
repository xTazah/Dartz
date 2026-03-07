import { DragEndEvent } from "@dnd-kit/core";
import { GAME_MODES } from "./constants";
import { ReactNode } from "react";

//user that is received by an api call
export type User = {
  id: number;
  username: string;
  initial: string;
  dartColor?: string; // Hex color code for dart customization
  allowNoAuth?: boolean; // Allow friends to add as local player without password
} | null;

//Player Throws
export type Throw = {
  score1: number;
  multiplier1: Multiplier;
  score2: number;
  multiplier2: Multiplier;
  score3: number;
  multiplier3: Multiplier;
};

//player that is used inside a lobby
export type Player = ConnectedPlayer & {
  score: number;
  throws: Throw[];
  legs: number;
  sets: number;
};

export type ConnectedPlayer = {
  user: User;
  connected: boolean; //in case someone disconnects he doesnt get kicked out of lobby but remains as disconnected
};

export enum GameStatus {
  Waiting,
  Running,
  Finished,
}

export enum Multiplier {
  Single = 1,
  Double = 2,
  Tripple = 3,
}

export type Lobby = {
  id: string;
  players: Player[]; //actual players
  spectators: ConnectedPlayer[]; //spectators that join while game is already running
  owner: User;
  gameStatus: GameStatus;
  currentPlayerIndex: number;
  gameMode: GameMode;
  legs: number;
  sets: number;
  customData?: Record<string, any>; // game-specific data
};

// Dart position data synced for real-time display to all players
export interface CurrentTurnDarts {
  playerId: number;
  darts: Array<{ 
    x: number; 
    y: number; 
    z: number;
    score?: number;
    multiplier?: Multiplier;
  }>;
}

export type GameMode = (typeof GAME_MODES)[number];

export interface GameLogic {
  /**
   * Initialize the game-specific logic in the lobby.
   */
  initialize(lobby: Lobby): Lobby;

  /**
   * Process a player's turn and update the lobby state.
   */
  processTurn(lobby: Lobby, player: Player, score: Throw): Lobby;

  undoTurn(lobby: Lobby): Lobby;

  removeLastThrows(lobby: Lobby): Lobby;
}

export interface LobbyInvite {
  lobbyId: string;
  sender: User;
}

export interface FriendRequest {
  userId: number; //sender
  username: string; //sender
}

export interface FriendlistUser {
  user: User;
  online: boolean;
  openLobbyInvites?: LobbyInvite[];
  openFriendRequests?: FriendRequest[];
}

export enum DragDataType {
  FRIEND = "FRIEND",
  OTHER = "OTHER",
}

export interface DropZoneProps {
  dropzoneId: string;
  allowedDataTypes: DragDataType[];
  onDrop: (event: DragEndEvent) => void;
}

export interface DraggableProps {
  id: number;
  data: { type: DragDataType; customData?: any };
  children: ReactNode;
  className?: string; // allow styling
}

export interface ApiResponse<T> {
  data: any;
  status: number;
  error?: string;
}

// Match submission payload (sent to backend when game finishes)
export interface MatchSubmissionPayload {
  gameModeKey: string;
  sets: number;
  legs: number;
  winnerPlayerId: number;
  startedAt: string; // ISO date string
  finishedAt: string; // ISO date string
  players: MatchSubmissionPlayer[];
}

export interface MatchSubmissionPlayer {
  playerId: number;
  playerIndex: number;
  finalSets: number;
  finalLegs: number;
  throws: MatchSubmissionThrow[];
}

export interface MatchSubmissionThrow {
  score1: number;
  multiplier1: number;
  score2: number;
  multiplier2: number;
  score3: number;
  multiplier3: number;
}

// Match history entry (received from backend)
export interface MatchHistoryEntry {
  matchId: number;
  gameModeKey: string;
  finishedAt: string;
  winnerUsername: string;
  winnerPlayerId: number;
  sets: number;
  legs: number;
  players: MatchHistoryPlayer[];
}

export interface MatchHistoryPlayer {
  playerId: number;
  username: string;
  initial: string;
  finalSets: number;
  finalLegs: number;
  average: number;
}

// Full match detail (for replay)
export interface MatchDetail {
  matchId: number;
  gameModeKey: string;
  sets: number;
  legs: number;
  startedAt: string;
  finishedAt: string;
  winnerPlayerId: number;
  winnerUsername: string;
  players: MatchDetailPlayer[];
  matchLegs: MatchDetailLeg[];
}

export interface MatchDetailPlayer {
  playerId: number;
  username: string;
  initial: string;
  playerIndex: number;
  finalSets: number;
  finalLegs: number;
}

export interface MatchDetailLeg {
  legNumber: number;
  winnerPlayerId: number | null;
  turns: MatchDetailTurn[];
}

export interface MatchDetailTurn {
  turnNumber: number;
  playerId: number;
  username: string;
  scoreBefore: number;
  scoreAfter: number;
  totalPoints: number;
  isBust: boolean;
  darts: MatchDetailDart[];
}

export interface MatchDetailDart {
  dartNumber: number;
  baseScore: number;
  multiplier: number;
}

// Player statistics (precomputed)
export interface PlayerStatsResponse {
  playerId: number;
  username: string;
  totalMatches: number;
  totalWins: number;
  winRate: number;
  totalLegs: number;
  totalLegsWon: number;
  overallAverage: number;
  totalDarts: number;
  highestTurnScore: number;
  count100Plus: number;
  count140Plus: number;
  count180s: number;
  totalBusts: number;
  totalCheckoutAttempts: number;
  totalCheckouts: number;
  checkoutRate: number;
  highestCheckout: number;
  bestLegDarts: number | null;
  bestMatchAverage: number;
  worstMatchAverage: number;
  currentWinStreak: number;
  longestWinStreak: number;
  first9Average: number;
  dartsPerLeg: number;
  lastPlayedAt: string | null;
}

// Opponent head-to-head stats
export interface OpponentStatsEntry {
  opponentPlayerId: number;
  opponentUsername: string;
  opponentInitial: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  lastPlayedAt: string | null;
}

// Analytics
export interface ActivityDay {
  date: string; // "yyyy-MM-dd"
  count: number;
}

export interface MatchTrendPoint {
  matchId: number;
  date: string;
  average: number;
  won: boolean;
}
