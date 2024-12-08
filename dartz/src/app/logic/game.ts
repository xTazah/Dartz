import { GAME_MODES, type GameMode } from "@/app/utils/constants";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Lobby {
  id: string;
  players: Player[];
  owner: Player;
  currentPlayerIndex: number;
  isGameOver: boolean;
  gameMode: GameMode;
}

function handleThrow(state: Lobby, points: number): Lobby {
  const currentPlayer = state.players[state.currentPlayerIndex];
  currentPlayer.score += points;

  // test logic
  if (currentPlayer.score >= 501) {
    return { ...state, isGameOver: true };
  }

  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
  };
}

function addPlayer (state: Lobby, player: Player): Lobby {
  return {
    ...state,
    players: [...state.players, player],
  };
};


export { handleThrow,addPlayer };
export type { Lobby, Player, GameMode };
