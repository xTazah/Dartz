import { GameLogic, GameStatus, Lobby, Player } from "@/app/utils/types";

export const fiveHundredOneLogic: GameLogic = {
  initialize(lobby) {
    const updatedLobby = { ...lobby };
    updatedLobby.players.forEach((player) => {
      player.score = 501;
    });
    return updatedLobby;
  },

  processTurn(lobby: Lobby, player: Player, score: number) {
    //toDo: score is not a number but DartThrowObject
    const updatedLobby = { ...lobby };

    if (
      updatedLobby.players[updatedLobby.currentPlayerIndex].user?.id !==
      player.user?.id
    ) {
      throw new Error("Invalid turn");
    }

    // calc new score
    const newScore =
      updatedLobby.players[updatedLobby.currentPlayerIndex].score - score;

    if (newScore === 0 && scoreIsDouble(score)) {
      updatedLobby.gameStatus = GameStatus.Finished;
    } else if (newScore < 0) {
      // Bust: do nothing
    } else {
      updatedLobby.players[updatedLobby.currentPlayerIndex].score = newScore;
    }

    // next player
    updatedLobby.currentPlayerIndex =
      (updatedLobby.currentPlayerIndex + 1) % updatedLobby.players.length;

    return updatedLobby;
  },
};

// helper function
function scoreIsDouble(score: number): boolean {
  return score % 2 === 0; //todo
}
