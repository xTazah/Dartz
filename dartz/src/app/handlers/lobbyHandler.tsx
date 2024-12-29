"use client";
import {
  syncLobby,
  loadLobby,
  listenToLobby,
  setUserConnected,
  getLobbySnapshot,
} from "../services/lobbyService";
import { LobbyNotFoundError, MissingLobbyDataError } from "../utils/errors";
import {
  GameMode,
  Lobby,
  GameStatus,
  User,
  Player,
  Throw,
} from "../utils/types";
import IdGenerator from "../utils/idGenerator";
import { GAME_MODES } from "../utils/constants";
import { toast } from "sonner";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";

class LobbyHandler {
  static createLobby(user: User, gameMode: GameMode): Lobby {
    const newLobby: Lobby = {
      id: IdGenerator.generateId(),
      currentPlayerIndex: 0,
      gameMode,
      gameStatus: GameStatus.Waiting,
      players: [],
      spectators: [],
      owner: user,
    };

    syncLobby(newLobby.id, newLobby);
    return newLobby;
  }

  static async getLobbyExists(id: string): Promise<boolean> {
    const lobby = await getLobbySnapshot(id);
    if (!lobby) return false;
    return true;
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
    let updatedLobby;

    // check if player already exists (/was disconnected)
    if (lobby.players?.find((player) => player.user?.id === user?.id)) {
      updatedLobby = {
        ...lobby,
        players: lobby.players.map((player) =>
          player.user?.id === user?.id
            ? { ...player, connected: true } //update connected status to true of this player
            : player
        ),
      };
      toast("Reconnected", {
        duration: 3000,
        icon: <ArrowPathRoundedSquareIcon />,
      });
    } //join as spector if already running
    else if (
      lobby.gameStatus == GameStatus.Running ||
      lobby.gameStatus == GameStatus.Finished
    ) {
      if (!lobby.spectators?.find((spectator) => spectator?.id === user?.id)) {
        updatedLobby = {
          ...lobby,
          spectators: [...lobby.spectators, user],
        };
        toast.info("Game is already running. You are now spectating.");
      }
    } else {
      updatedLobby = {
        ...lobby,
        players: [
          ...lobby.players,
          { user, score: 0, throws: [], connected: true },
        ],
      };
    }
    //sync and return updated lobby if something changed (updatedLobby is undefined otherwise )
    if (updatedLobby) {
      setUserConnected(updatedLobby.id, updatedLobby.players.length - 1);
      syncLobby(updatedLobby.id, updatedLobby);
      return updatedLobby;
    }

    return lobby; // No changes if player already exists
  }

  static startGame(lobby: Lobby): Lobby {
    const gameModeLogic = GAME_MODES.find(
      (gm) => gm.key === lobby.gameMode.key
    )?.logic;
    if (!gameModeLogic) throw new Error("Game mode logic not found!");

    let updatedLobby = gameModeLogic.initialize(lobby);

    return this.changeGameStatus(updatedLobby, GameStatus.Running);
  }

  static handlePlayerScore(lobby: Lobby, player: Player, score: Throw): Lobby {
    const gameModeLogic = GAME_MODES.find(
      (gm) => gm.key === lobby.gameMode.key
    )?.logic;
    if (!gameModeLogic) throw new Error("Game mode logic not found!");

    const updatedLobby = gameModeLogic.processTurn(lobby, player, score);

    syncLobby(updatedLobby.id, updatedLobby);

    return updatedLobby;
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
