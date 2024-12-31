import { GAME_MODES } from "./constants";

//user that is received by an api call
export type User = {
  id: number;
  username: string;
  initial: string;
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
}

export interface LobbyInvite {
  lobbyId: string;
  username: string;
}

export interface FriendRequest {
  userId: string;
  username: string;
}

export interface FirebaseUser {
  user: User;
  online: boolean;
  openLobbyInvites?: LobbyInvite[];
  openFriendRequests?: FriendRequest[];
}

export enum DragDataType {
  FRIEND = "FRIEND",
  OTHER = "OTHER",
}

export interface DragDropProps {
  dropzoneId: string;
  dragDataTypes: DragDataType[];
}
