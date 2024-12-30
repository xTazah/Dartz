import { GameLogic, GameStatus, Lobby, Player, Throw } from "@/app/utils/types";

export const fiveHundredOneLogic: GameLogic = {
  initialize(lobby) {
    const updatedLobby = { ...lobby };
    updatedLobby.players.forEach((player) => {
      player.score = 501;
    });
    return updatedLobby;
  },

  processTurn(lobby: Lobby, player: Player, throws: Throw) {
    const updatedLobby = { ...lobby };

    if (
      updatedLobby.players[updatedLobby.currentPlayerIndex].user?.id !==
      player.user?.id
    ) {
      throw new Error("Invalid turn");
    }

    let score =
      throws.score1 * throws.multiplier1 +
      throws.score2 * throws.multiplier2 +
      throws.score3 * throws.multiplier3;

    // calc new score
    const newScore =
      updatedLobby.players[updatedLobby.currentPlayerIndex].score - score;

    if (newScore === 0) {
      updatedLobby.players[updatedLobby.currentPlayerIndex].score = newScore;
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws.push(throws);
      updatedLobby.players[updatedLobby.currentPlayerIndex].legs += 1;
      if (
        updatedLobby.legs != 0 &&
        updatedLobby.sets != 0 &&
        updatedLobby.players[updatedLobby.currentPlayerIndex].legs ===
          updatedLobby.legs
      ) {
        updatedLobby.players[updatedLobby.currentPlayerIndex].sets++;
        updatedLobby.players[updatedLobby.currentPlayerIndex].legs = 0;
      }
      updatedLobby.gameStatus = GameStatus.Finished;
    } else if (newScore < 0) {
      if (!updatedLobby.players[updatedLobby.currentPlayerIndex].throws)
        updatedLobby.players[updatedLobby.currentPlayerIndex].throws = [];
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws.push(
        createEmptyThrows()
      );
    } else {
      updatedLobby.players[updatedLobby.currentPlayerIndex].score = newScore;
      if (!updatedLobby.players[updatedLobby.currentPlayerIndex].throws)
        updatedLobby.players[updatedLobby.currentPlayerIndex].throws = [];
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws.push(throws);
    }
    // next player
    updatedLobby.currentPlayerIndex =
      (updatedLobby.currentPlayerIndex + 1) % updatedLobby.players.length;

    return updatedLobby;
  },
};

// helper function
function createEmptyThrows() {
  let emptyThrows: Throw = {
    score1: 0,
    multiplier1: 1,
    score2: 0,
    multiplier2: 1,
    score3: 0,
    multiplier3: 1,
  };
  return emptyThrows;
}
