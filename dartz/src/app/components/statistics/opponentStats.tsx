"use client";

import React, { useContext, useEffect, useState } from "react";
import MatchService from "@/app/services/backend/matchService";
import { OpponentStatsEntry } from "@/app/utils/types";
import { UserContext } from "../userProvider/userProvider";
import styles from "../../styles/statistics.module.scss";
import { UsersIcon } from "@heroicons/react/24/solid";

export default function OpponentStats() {
  const context = useContext(UserContext);
  const user = context?.user;

  const [opponents, setOpponents] = useState<OpponentStatsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const matchService = new MatchService();
    matchService
      .getOpponentStats(user.id)
      .then((res) => setOpponents(res.data ?? []))
      .catch((err) => console.error("Failed to load opponent stats:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className={styles.statsGrid}>
        {[1, 2].map((i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (opponents.length === 0) {
    return (
      <div className={styles.emptyState} style={{ padding: "24px 16px" }}>
        <UsersIcon className={styles.emptyIcon} />
        <div className={styles.emptySubtitle}>
          Play a match to see your head-to-head records
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      {opponents.map((opp) => (
        <div key={opp.opponentPlayerId} className={styles.statCard}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--component-background-hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "var(--font-color)",
              flexShrink: 0,
            }}
          >
            {opp.opponentInitial}
          </div>
          <span
            className={styles.statLabel}
            style={{ textTransform: "none", letterSpacing: 0 }}
          >
            {opp.opponentUsername}
          </span>
          <span className={styles.statValueSmall}>
            {opp.wins}W - {opp.losses}L
          </span>
          <span
            className={styles.statLabel}
            style={{
              color:
                opp.winRate >= 50
                  ? "var(--primary)"
                  : "var(--font-color-muted)",
            }}
          >
            {opp.winRate.toFixed(0)}% win rate
          </span>
        </div>
      ))}
    </div>
  );
}
