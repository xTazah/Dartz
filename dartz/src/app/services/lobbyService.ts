import { syncLobby, loadLobby } from "../handlers/lobbyHandler"; 
import { LobbyNotFoundError } from "../utils/errors";
import { GameMode, Lobby, LobbyStatus, User } from "../utils/types";

function createLobby(id: string, owner: User, gameMode: GameMode): Lobby {
  const newLobby: Lobby = {
    id: id,
    currentPlayerIndex: 0,
    gameMode: gameMode,
    status: LobbyStatus.Waiting,
    players: [],
    owner,
  };

  syncLobby(id, newLobby);

  return newLobby;
}

async function joinLobby(id: string, user: User): Promise<Lobby> {
    try {
      const lobby = await loadLobby(id);
      return addPlayer(lobby, user); 
    } catch (error) {
      throw error;  // Let the caller handle the error
    }
  }



function addPlayer (lobby: Lobby, user: User): Lobby {
    const updatedLobby =  {
        ...lobby,
        players: [...lobby.players, {user: user, score: 0}],
      };
    syncLobby(lobby.id, updatedLobby);

    return updatedLobby
  };

export { createLobby, joinLobby };
