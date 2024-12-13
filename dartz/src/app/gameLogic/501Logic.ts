import { Lobby, LobbyStatus,GameLogic } from "../utils/types";

export const fiveHundredOneLogic: GameLogic = {
  handleThrow: (state, points) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    currentPlayer.score += points;

    return {
      ...state,
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    };
  },
  checkWinCondition: (state) => {
    return state.players.some((player) => player.score >= 501);
  },
};
