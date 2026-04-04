"use client";
import * as gameServerLobby from "../services/gameServer/lobbyService";
import { GameMode, Lobby, GameStatus, User, Player, Throw } from "../utils/types";
import IdGenerator from "../utils/idGenerator";
import { GAME_MODES } from "../utils/constants";
import { toast } from "sonner";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";

// Maps a ServerLobby (from the game server) to a frontend Lobby with Icon/logic
export function mapServerLobbyToLobby(serverLobby: any): Lobby {
  const gameMode = GAME_MODES.find((gm) => gm.key === serverLobby.gameModeKey);
  return {
    id: serverLobby.id,
    players: (serverLobby.players ?? []).map((p: any) => ({
      user: {
        id: p.userId,
        username: p.username,
        initial: p.initial,
        profilePicture: p.profilePicture,
        dartColor: p.dartColor,
        bio: "",
        memberSince: new Date(),
      },
      connected: p.connected,
      score: p.score,
      throws: (p.throws ?? []).map((t: any) => ({
        score1: t.score1, multiplier1: t.multiplier1,
        score2: t.score2, multiplier2: t.multiplier2,
        score3: t.score3, multiplier3: t.multiplier3,
      })),
      legs: p.legs,
      sets: p.sets,
    })),
    spectators: (serverLobby.spectators ?? []).map((s: any) => ({
      user: {
        id: s.userId,
        username: s.username,
        initial: s.initial,
        profilePicture: s.profilePicture,
        bio: "",
        memberSince: new Date(),
      },
      connected: s.connected,
    })),
    owner: {
      id: serverLobby.ownerUserId,
      username: serverLobby.ownerUsername,
      initial: "",
      profilePicture: "",
      bio: "",
      memberSince: new Date(),
    },
    gameStatus: serverLobby.gameStatus as GameStatus,
    currentPlayerIndex: serverLobby.currentPlayerIndex,
    gameMode: gameMode ?? GAME_MODES[1], // fallback to 501
    legs: serverLobby.targetLegs,
    sets: serverLobby.targetSets,
    customData: serverLobby.currentTurnDarts
      ? { currentTurnDarts: serverLobby.currentTurnDarts }
      : undefined,
  };
}

class LobbyHandler {
  static async getLobbyExists(lobbyId: string): Promise<boolean> {
    return gameServerLobby.checkLobbyExists(lobbyId);
  }

  static async createLobby(user: User, gameMode: GameMode): Promise<string> {
    const lobbyId = IdGenerator.generateId();
    await gameServerLobby.createLobby(
      lobbyId, user!.id, user!.username, gameMode.key
    );
    return lobbyId;
  }

  static async joinLobby(
    lobbyId: string,
    user: User
  ): Promise<Lobby | null> {
    const serverLobby = await gameServerLobby.joinLobby(
      lobbyId,
      user!.id,
      user!.username,
      user!.initial,
      user!.profilePicture,
      user!.dartColor ?? "#e42b2bff"
    );
    if (!serverLobby) return null;
    return mapServerLobbyToLobby(serverLobby);
  }

  static async leaveLobby(lobbyId: string, userId: number): Promise<void> {
    await gameServerLobby.leaveLobby(lobbyId, userId);
  }

  static async startGame(lobbyId: string): Promise<void> {
    await gameServerLobby.startGame(lobbyId);
  }

  static async handlePlayerScore(
    lobbyId: string,
    userId: number,
    score: Throw
  ): Promise<void> {
    await gameServerLobby.submitThrow(lobbyId, userId, {
      score1: score.score1, multiplier1: score.multiplier1,
      score2: score.score2, multiplier2: score.multiplier2,
      score3: score.score3, multiplier3: score.multiplier3,
    });
  }

  static async handleUndo(lobbyId: string, userId: number): Promise<void> {
    await gameServerLobby.undoTurn(lobbyId, userId);
  }

  static async changeGameMode(
    lobbyId: string,
    gameModeKey: string
  ): Promise<void> {
    await gameServerLobby.changeGameMode(lobbyId, gameModeKey);
  }

  static async changeSetsAndLegs(
    lobbyId: string,
    sets: number,
    legs: number
  ): Promise<void> {
    await gameServerLobby.changeSetsAndLegs(lobbyId, sets, legs);
  }

  static async syncCurrentTurnDarts(
    lobbyId: string,
    playerId: number,
    darts: Array<{ x: number; y: number; z: number; score?: number; multiplier?: number }>
  ): Promise<void> {
    await gameServerLobby.syncDartPositions(lobbyId, playerId, darts);
  }
}

export default LobbyHandler;
