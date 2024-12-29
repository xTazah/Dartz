import { GAME_MODES } from "./constants";

//user that is received by an api call
export type User = {
  id: number;
  username: string;
  initial: string;
} | null;

//player that is used inside a lobby
export type Player = {
  user: User;
  score: number;
  connected: boolean; //in case someone disconnects he doesnt get kicked out of lobby but remains as disconnected
};

export enum GameStatus {
  Waiting,
  Running,
  Finished,
}

export type Lobby = {
  id: string;
  players: Player[]; //actual players
  spectators: User[]; //spectators that join while game is already running
  owner: User;
  gameStatus: GameStatus;
  currentPlayerIndex: number;
  gameMode: GameMode;
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
  processTurn(lobby: Lobby, player: Player, score: number): Lobby;
}
