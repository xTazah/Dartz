"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/statistics.module.scss";
import MatchService from "@/app/services/backend/matchService";
import { PlayerStatsResponse } from "@/app/utils/types";
import { UserContext } from "../userProvider/userProvider";

export default function Statistics() {
  const context = useContext(UserContext);
  const user = context?.user;

  const [stats, setStats] = useState<PlayerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const matchService = new MatchService();
    matchService
      .getPlayerStats(user.id)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load stats:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center flex-col">
        <div
          className={
            styles.circle +
            " flex justify-center items-center flex-col mt-4 mb-4"
          }
        >
          <div className={styles.statLabel}>Games Played</div>
          <div className={styles.amount}>—</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col">
      <div
        className={
          styles.circle +
          " flex justify-center items-center flex-col mt-4 mb-4"
        }
      >
        <div className={styles.statLabel}>Games Played</div>
        <div className={styles.amount}>{stats?.totalMatches ?? 0}</div>
      </div>
      <div className="">
        <div className="flex justify-center items-center flex-col p-2">
          <div className={styles.statLabel}>Average</div>
          <div className={styles.amount2}>
            {stats?.overallAverage?.toFixed(1) ?? "—"}
          </div>
        </div>
        <div className="flex justify-center items-center flex-col p-2">
          <div className={styles.statLabel}>Win Rate</div>
          <div className={styles.amount2}>
            {stats ? `${stats.winRate.toFixed(0)} %` : "—"}
          </div>
        </div>
        <div className="flex justify-center items-center flex-col p-2">
          <div className={styles.statLabel}>Checkout %</div>
          <div className={styles.amount2}>
            {stats ? `${stats.checkoutRate.toFixed(0)} %` : "—"}
          </div>
        </div>
        <div className="flex justify-center items-center flex-col p-2">
          <div className={styles.statLabel}>Win Streak</div>
          <div className={styles.amount2}>
            {stats?.currentWinStreak ?? "—"} 🔥
          </div>
        </div>
      </div>
    </div>
  );
}
