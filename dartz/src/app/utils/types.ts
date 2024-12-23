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
};

export enum GameStatus {
  Waiting,
  Running,
  Finished,
}

export type Lobby = {
  id: string;
  players: Player[];
  owner: User;
  gameStatus: GameStatus;
  currentPlayerIndex: number;
  gameMode: GameMode;
};

export type GameMode = (typeof GAME_MODES)[number];

export interface GameLogic {
  handleThrow: (state: Lobby, points: number) => Lobby;
  checkWinCondition: (state: Lobby) => boolean;
}
