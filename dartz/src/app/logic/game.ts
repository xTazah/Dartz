import { Lobby, LobbyStatus } from "../utils/types";

function handleThrow(state: Lobby, points: number): Lobby {
  const currentPlayer = state.players[state.currentPlayerIndex];
  currentPlayer.score += points;

  // test logic
  if (currentPlayer.score >= 501) {
    return { ...state, status: LobbyStatus.Finished };
  }

  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
  };
}



export { handleThrow };
