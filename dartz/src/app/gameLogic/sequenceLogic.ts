import { GameLogic, GameStatus, Lobby, Throw } from "@/app/utils/types";

/**
 * Shared logic for the "sequence" game modes, where players work through a
 * series of targets instead of counting down points:
 *
 * - around-the-clock: targets 1-20 in order, then Bull. Any multiplier counts.
 * - double-training:  targets D1-D20 in order. Only doubles count.
 *
 * player.score holds the CURRENT TARGET (1..20, or 25 for Bull).
 * The server (GameModeLogic.cs) is authoritative; this module mirrors its
 * rules so the UI can preview target progression while entering darts.
 */

export const BULL = 25;

export type SequenceModeKey = "around-the-clock" | "double-training";

const RULES: Record<SequenceModeKey, { doublesOnly: boolean; endWithBull: boolean }> = {
  "around-the-clock": { doublesOnly: false, endWithBull: true },
  "double-training": { doublesOnly: true, endWithBull: false },
};

export function isSequenceMode(key: string): key is SequenceModeKey {
  return key === "around-the-clock" || key === "double-training";
}

export interface SequenceDart {
  score: number;
  multiplier: number;
}

export interface SequenceSimulation {
  /** Target after applying the darts (unchanged if completed). */
  target: number;
  /** Number of targets hit by these darts. */
  hits: number;
  /** True if the final target was hit, i.e. the leg is won. */
  completed: boolean;
}

/** Applies darts to a starting target using the mode's rules. */
export function simulateSequenceThrow(
  modeKey: SequenceModeKey,
  startTarget: number,
  darts: SequenceDart[]
): SequenceSimulation {
  const { doublesOnly, endWithBull } = RULES[modeKey];
  let target = startTarget;
  let hits = 0;
  let completed = false;

  for (const dart of darts) {
    if (completed) break;

    const hit = doublesOnly
      ? dart.score === target && dart.multiplier === 2
      : dart.score === target;
    if (!hit) continue;

    hits++;
    if (target === 20) {
      if (endWithBull) target = BULL;
      else completed = true;
    } else if (target === BULL) {
      completed = true;
    } else {
      target++;
    }
  }

  return { target, hits, completed };
}

/** Human-readable label for a target, e.g. "17", "D17" or "Bull". */
export function formatTargetLabel(modeKey: SequenceModeKey, target: number): string {
  if (target === BULL) return "Bull";
  return RULES[modeKey].doublesOnly ? `D${target}` : `${target}`;
}

/** 1-based position in the sequence and total number of targets. */
export function sequenceProgress(
  modeKey: SequenceModeKey,
  target: number
): { step: number; total: number } {
  const total = RULES[modeKey].endWithBull ? 21 : 20;
  const step = target === BULL ? 21 : Math.min(target, total);
  return { step, total };
}

function throwToDarts(t: Throw): SequenceDart[] {
  return [
    { score: t.score1, multiplier: t.multiplier1 },
    { score: t.score2, multiplier: t.multiplier2 },
    { score: t.score3, multiplier: t.multiplier3 },
  ];
}

/**
 * GameLogic implementation mirroring the server rules (used as the mode's
 * client-side logic in GAME_MODES; the server remains authoritative).
 */
export function createSequenceLogic(modeKey: SequenceModeKey): GameLogic {
  return {
    initialize(lobby: Lobby) {
      const updatedLobby = { ...lobby };
      updatedLobby.players.forEach((player) => {
        player.score = 1;
      });
      return updatedLobby;
    },

    processTurn(lobby: Lobby, player, throws: Throw) {
      const updatedLobby = { ...lobby };
      const current = updatedLobby.players[updatedLobby.currentPlayerIndex];

      if (current.user?.id !== player.user?.id) {
        throw new Error("Invalid turn");
      }

      const { target, completed } = simulateSequenceThrow(
        modeKey,
        current.score,
        throwToDarts(throws)
      );

      current.score = target;
      if (!current.throws) current.throws = [];
      current.throws.push(throws);

      if (completed) {
        current.legs += 1;
        if (
          updatedLobby.legs != 0 &&
          updatedLobby.sets != 0 &&
          current.legs === updatedLobby.legs
        ) {
          current.sets++;
          current.legs = 0;
        }
        updatedLobby.gameStatus = GameStatus.Finished;
      }

      updatedLobby.currentPlayerIndex =
        (updatedLobby.currentPlayerIndex + 1) % updatedLobby.players.length;

      return updatedLobby;
    },

    undoTurn(lobby: Lobby) {
      const updatedLobby = { ...lobby };
      const playercount = updatedLobby.players.length;
      updatedLobby.currentPlayerIndex =
        (updatedLobby.currentPlayerIndex - 1 + playercount) % playercount;
      return updatedLobby;
    },

    removeLastThrows(lobby: Lobby) {
      const updatedLobby = { ...lobby };
      const player = updatedLobby.players[updatedLobby.currentPlayerIndex];
      if (player.throws?.length >= 1) {
        player.throws.pop();
        // Recompute the target by replaying the remaining throws of this leg
        const replay = player.throws.flatMap(throwToDarts);
        player.score = simulateSequenceThrow(modeKey, 1, replay).target;
      }
      return updatedLobby;
    },
  };
}
