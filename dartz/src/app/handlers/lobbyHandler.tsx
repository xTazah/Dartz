"use client";
import {
  syncLobby,
  loadLobby,
  listenToLobby,
  setUserConnected,
  getLobbySnapshot,
} from "../services/firebase/lobbyService";
import { LobbyNotFoundError, MissingLobbyDataError } from "../utils/errors";
import {
  GameMode,
  Lobby,
  GameStatus,
  User,
  Player,
  Throw,
  ConnectedPlayer,
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
      legs: 0,
      sets: 0,
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
    var isSpectator = false;

    // check if player already exists (/was disconnected)
    const existingPlayer = lobby.players?.find(
      (player) => player.user?.id === user?.id
    );
    const existingSpectator = lobby.spectators?.find(
      (spectator) => spectator?.user?.id === user?.id
    );

    // If player was disconnected, reconnect them
    if (existingPlayer) {
      updatedLobby = {
        ...lobby,
        players: lobby.players.map((player) =>
          player.user?.id === user?.id
            ? { ...player, connected: true } // update connected status to true for the player
            : player
        ),
      };
      toast("Reconnected as Player", {
        duration: 3000,
        icon: <ArrowPathRoundedSquareIcon />,
      });
    }
    // If spectator, reconnect as a spectator
    else if (existingSpectator) {
      updatedLobby = {
        ...lobby,
        spectators: lobby.spectators.map((spectator) =>
          spectator.user?.id === user?.id
            ? { ...spectator, connected: true } // update connected status for the spectator
            : spectator
        ),
      };
      toast("Reconnected as Spectator", {
        duration: 3000,
        icon: <ArrowPathRoundedSquareIcon />,
      });
      isSpectator = true;
    }
    // If game is running, join as a spectator
    else if (
      lobby.gameStatus == GameStatus.Running ||
      lobby.gameStatus == GameStatus.Finished
    ) {
      if (
        !lobby.spectators?.find((spectator) => spectator?.user?.id === user?.id)
      ) {
        updatedLobby = {
          ...lobby,
          spectators: [...lobby.spectators, { user } as ConnectedPlayer],
        };
        toast.info("Game is already running. You are now spectating.");
        isSpectator = true;
      }
    }
    // If game is not running, join as a player
    else {
      updatedLobby = {
        ...lobby,
        players: [
          ...lobby.players,
          { user, score: 0, throws: [], legs: 0, sets: 0, connected: true },
        ],
      };
    }

    // Sync and return updated lobby if something changed
    if (updatedLobby) {
      let index;
      if (isSpectator) index = updatedLobby.spectators.length - 1;
      else index = updatedLobby.players.length - 1;

      syncLobby(updatedLobby.id, updatedLobby);
      setUserConnected(updatedLobby.id, index, isSpectator);
      return updatedLobby;
    }

    // Return original lobby if no updates
    return lobby;
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

  static handleUndo(lobby: Lobby): Lobby {
    const gameModeLogic = GAME_MODES.find(
      (gm) => gm.key === lobby.gameMode.key
    )?.logic;
    if (!gameModeLogic) throw new Error("Game mode logic not found!");

    const updatedLobby = gameModeLogic.undoTurn(lobby);

    return updatedLobby;
  }

  static hanldeRemoveLastThrows(lobby: Lobby): Lobby {
    const gameModeLogic = GAME_MODES.find(
      (gm) => gm.key === lobby.gameMode.key
    )?.logic;
    if (!gameModeLogic) throw new Error("Game mode logic not found!");

    const updatedLobby = gameModeLogic.removeLastThrows(lobby);

    syncLobby(updatedLobby.id, updatedLobby);

    return updatedLobby;
  }

  static changeGameMode(lobby: Lobby, gameMode: GameMode): Lobby {
    const updatedLobby = { ...lobby, gameMode };
    syncLobby(updatedLobby.id, updatedLobby);
    return updatedLobby;
  }

  static changeSetsAndLegs(lobby: Lobby, sets: number, legs: number): Lobby {
    const updatedLobby = { ...lobby, sets, legs };
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
