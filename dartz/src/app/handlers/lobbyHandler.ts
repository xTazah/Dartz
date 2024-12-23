"use client";
import { syncLobby, loadLobby, listenToLobby } from "../services/lobbyService";
import { LobbyNotFoundError, MissingLobbyDataError } from "../utils/errors";
import { GameMode, Lobby, GameStatus, User } from "../utils/types";
import IdGenerator from "../utils/idGenerator";

class LobbyHandler {
  static createLobby(user: User, gameMode: GameMode): Lobby {
    const newLobby: Lobby = {
      id: IdGenerator.generateId(),
      currentPlayerIndex: 0,
      gameMode,
      gameStatus: GameStatus.Waiting,
      players: [],
      owner: user,
    };

    syncLobby(newLobby.id, newLobby);
    return newLobby;
  }

  static async loadLobby(id: string): Promise<Lobby> {
    const lobby = await loadLobby(id);
    if (!lobby) throw new LobbyNotFoundError(id);
    return lobby;
  }

  static listenToLobby(
    id: string,
    callback: (updatedLobby: Lobby) => void
  ): () => void {
    return listenToLobby(id, callback);
  }

  static addPlayer(lobby: Lobby, user: User): Lobby {
    if (!lobby.players.find((player) => player.user?.id === user?.id)) {
      const updatedLobby = {
        ...lobby,
        players: [...lobby.players, { user, score: 0 }],
      };

      syncLobby(updatedLobby.id, updatedLobby);
      return updatedLobby;
    }
    return lobby; // No changes if player already exists
  }

  static changeGameMode(lobby: Lobby, gameMode: GameMode): Lobby {
    const updatedLobby = { ...lobby, gameMode };
    syncLobby(updatedLobby.id, updatedLobby);
    return updatedLobby;
  }

  static changeGameStatus(lobby: Lobby, gameStatus: GameStatus): Lobby {
    const updatedLobby = { ...lobby, gameStatus };
    syncLobby(updatedLobby.id, updatedLobby);
    return updatedLobby;
  }
}

export default LobbyHandler;
