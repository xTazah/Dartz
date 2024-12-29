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
    //toDo: score is not a number but DartThrowObject
    const updatedLobby = { ...lobby };

    if (
      updatedLobby.players[updatedLobby.currentPlayerIndex].user?.id !==
      player.user?.id
    ) {
      throw new Error("Invalid turn");
    }

    let score = throws.score1*throws.multiplier1+throws.score2*throws.multiplier2+throws.score3*throws.multiplier3;

    // calc new score
    const newScore =
      updatedLobby.players[updatedLobby.currentPlayerIndex].score - score;

    if (newScore === 0 && scoreIsDouble(score)) {
      updatedLobby.gameStatus = GameStatus.Finished;
    } else if (newScore < 0) {
      // Bust: do nothing
    } else {
      updatedLobby.players[updatedLobby.currentPlayerIndex].score = newScore;
      if(!updatedLobby.players[updatedLobby.currentPlayerIndex].throws)
        updatedLobby.players[updatedLobby.currentPlayerIndex].throws = []
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws.push(throws);
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
