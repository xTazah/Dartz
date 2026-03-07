"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MatchService from "@/app/services/backend/matchService";
import {
  MatchDetail,
  MatchDetailLeg,
  MatchDetailTurn,
  MatchDetailDart,
} from "@/app/utils/types";
import styles from "@/app/styles/matchDetail.module.scss";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";

const GAME_MODE_LABELS: Record<string, string> = {
  "501": "501",
  "around-the-clock": "Around the Clock",
  "double-training": "Double Training",
};

function formatDart(dart: MatchDetailDart): { label: string; style: string } {
  if (dart.baseScore === 0)
    return { label: "MISS", style: styles.dartChipMiss };
  const prefix =
    dart.multiplier === 3 ? "T" : dart.multiplier === 2 ? "D" : "";
  const chipStyle =
    dart.multiplier === 3
      ? styles.dartChipTriple
      : dart.multiplier === 2
      ? styles.dartChipDouble
      : "";
  return { label: `${prefix}${dart.baseScore}`, style: chipStyle };
}

export default function MatchDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matchId = searchParams.get("id");

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedLegs, setExpandedLegs] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!matchId) {
      setError(true);
      setLoading(false);
      return;
    }

    const matchService = new MatchService();
    matchService
      .getMatchDetail(parseInt(matchId))
      .then((res) => {
        setMatch(res.data);
        // Auto-expand first leg
        if (res.data?.matchLegs?.length > 0) {
          setExpandedLegs(new Set([res.data.matchLegs[0].legNumber]));
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [matchId]);

  const toggleLeg = (legNumber: number) => {
    setExpandedLegs((prev) => {
      const next = new Set(prev);
      if (next.has(legNumber)) next.delete(legNumber);
      else next.add(legNumber);
      return next;
    });
  };

  if (loading) {
    return (
      <div className={styles.matchDetailContainer}>
        <div className={styles.matchHeader}>
          <div className={styles.matchHeaderTop}>
            <div className={styles.backButton} onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
            <h1 className={styles.matchTitle}>Loading match...</h1>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className={styles.matchDetailContainer}>
        <div className={styles.matchHeader}>
          <div className={styles.matchHeaderTop}>
            <div className={styles.backButton} onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
            <h1 className={styles.matchTitle}>Match not found</h1>
          </div>
        </div>
        <div className={styles.errorState}>
          <p>This match could not be loaded.</p>
        </div>
      </div>
    );
  }

  const date = new Date(match.finishedAt);
  const formattedDate = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const modeLabel =
    GAME_MODE_LABELS[match.gameModeKey] ?? match.gameModeKey;

  return (
    <div className={styles.matchDetailContainer}>
      {/* Header */}
      <div className={styles.matchHeader}>
        <div className={styles.matchHeaderTop}>
          <div className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4" />
          </div>
          <h1 className={styles.matchTitle}>Match Detail</h1>
        </div>
        <p className={styles.matchSubtitle}>
          <span className={styles.modeBadge}>{modeLabel}</span>
          {formattedDate}
          {" · "}
          {match.sets > 1
            ? `First to ${match.sets} sets`
            : `First to ${match.legs} legs`}
        </p>
      </div>

      {/* Player Summary */}
      <div className={styles.playerSummary}>
        {match.players.map((player) => {
          const isWinner = player.playerId === match.winnerPlayerId;
          return (
            <div
              key={player.playerId}
              className={`${styles.playerCard} ${
                isWinner ? styles.playerCardWinner : ""
              }`}
            >
              <div
                className={`${styles.playerInitial} ${
                  isWinner ? styles.playerInitialWinner : ""
                }`}
              >
                {player.initial}
              </div>
              <div className={styles.playerInfo}>
                <div className={styles.playerName}>{player.username}</div>
                <div className={styles.playerScore}>
                  {match.sets > 1
                    ? `${player.finalSets} sets, ${player.finalLegs} legs`
                    : `${player.finalLegs} legs`}
                </div>
              </div>
              {isWinner && (
                <TrophyIcon className={`w-5 h-5 ${styles.winnerBadge}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legs */}
      <div className={styles.legsSection}>
        {match.matchLegs.map((leg: MatchDetailLeg) => {
          const isExpanded = expandedLegs.has(leg.legNumber);
          const legWinnerPlayer = match.players.find(
            (p) => p.playerId === leg.winnerPlayerId
          );

          return (
            <div key={leg.legNumber} className={styles.legCard}>
              <div
                className={styles.legHeader}
                onClick={() => toggleLeg(leg.legNumber)}
              >
                <div className={styles.legTitle}>
                  Leg {leg.legNumber}
                  {legWinnerPlayer && (
                    <span className={styles.legWinner}>
                      Won by {legWinnerPlayer.username}
                    </span>
                  )}
                </div>
                <ChevronDownIcon
                  className={`${styles.chevron} ${
                    isExpanded ? styles.chevronOpen : ""
                  }`}
                />
              </div>

              {isExpanded && (
                <div className={styles.turnsTable}>
                  {/* Header row */}
                  <div className={`${styles.turnRow} ${styles.turnRowHeader}`}>
                    <div></div>
                    <div>Player</div>
                    <div style={{ textAlign: "center" }}>Pts</div>
                    <div style={{ textAlign: "center" }}>Score</div>
                    <div></div>
                    <div>Darts</div>
                  </div>

                  {/* Turn rows */}
                  {leg.turns.map((turn: MatchDetailTurn, idx: number) => (
                    <div
                      key={idx}
                      className={`${styles.turnRow} ${
                        turn.isBust ? styles.turnRowBust : ""
                      }`}
                    >
                      <div className={styles.turnInitial}>
                        {match.players.find(
                          (p) => p.playerId === turn.playerId
                        )?.initial ?? "?"}
                      </div>
                      <div className={styles.turnPlayer}>{turn.username}</div>
                      <div className={styles.turnPoints}>
                        {turn.totalPoints}
                        {turn.isBust && (
                          <span className={styles.bustTag}>BUST</span>
                        )}
                      </div>
                      <div className={styles.turnScore}>
                        {turn.scoreBefore} → {turn.scoreAfter}
                      </div>
                      <div></div>
                      <div className={styles.turnDarts}>
                        {turn.darts.map((dart, di) => {
                          const { label, style } = formatDart(dart);
                          return (
                            <span
                              key={di}
                              className={`${styles.dartChip} ${style}`}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
