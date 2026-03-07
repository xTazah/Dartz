"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/matchHistory.module.scss";
import { MatchHistoryEntry } from "@/app/utils/types";

interface HistoryItemProps {
  match: MatchHistoryEntry;
  playerId: number;
}

const GAME_MODE_LABELS: Record<string, string> = {
  "501": "501",
  "around-the-clock": "ATC",
  "double-training": "Doubles",
};

export default function HistoryItem({ match, playerId }: HistoryItemProps) {
  const router = useRouter();
  const isWin = match.winnerPlayerId === playerId;
  const playerNames = match.players.map((p) => p.username).join(", ");

  const currentPlayer = match.players.find((p) => p.playerId === playerId);
  const avg = currentPlayer?.average?.toFixed(1) ?? "—";

  const date = new Date(match.finishedAt);
  const formattedDate = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const modeLabel = GAME_MODE_LABELS[match.gameModeKey] ?? match.gameModeKey;

  return (
    <div
      className={styles.historyEntry}
      onClick={() => router.push(`/match?id=${match.matchId}`)}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.entryLeft}>
        <div
          className={`${styles.resultBadge} ${isWin ? styles.win : styles.loss}`}
        >
          {isWin ? "W" : "L"}
        </div>
        <div className={styles.entryInfo}>
          <div className={styles.entryDate}>{formattedDate}</div>
          <div className={styles.entryPlayers}>{playerNames}</div>
        </div>
      </div>
      <div className={styles.entryRight}>
        <span className={styles.gameModeBadge}>{modeLabel}</span>
        <span className={styles.entryAvg}>Ø {avg}</span>
      </div>
    </div>
  );
}
