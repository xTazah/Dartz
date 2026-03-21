"use client";

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/app/components/userProvider/userProvider";
import MatchService from "@/app/services/backend/matchService";
import { PlayerStatsResponse } from "@/app/utils/types";
import styles from "@/app/styles/statistics.module.scss";
import HistoryList from "@/app/components/matchHistory/historyList";
import {
  ChartPieIcon,
  TrophyIcon,
  FireIcon,
  UsersIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import {
  TargetIcon,
  ZapIcon,
  CrownIcon,
  FlameIcon,
  SparklesIcon,
  ClockIcon,
} from "lucide-react";
import OpponentStats from "@/app/components/statistics/opponentStats";
import ActivityGraph from "@/app/components/statistics/activityGraph";

/** SVG donut ring */
function WinRateRing({ winRate, wins, losses }: { winRate: number; wins: number; losses: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100) * circumference;

  return (
    <div className={styles.ringCard}>
      <div className={styles.ringWrapper}>
        <svg className={styles.ringSvg} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--component-outline)" strokeWidth="10" />
          <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--primary)" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className={styles.ringProgress} transform="rotate(-90 64 64)" />
        </svg>
        <div className={styles.ringCenter}>
          <span className={styles.ringValue}>{winRate.toFixed(0)}%</span>
          <span className={styles.ringLabel}>Win Rate</span>
        </div>
      </div>
      <div className={styles.ringLegend}>
        <span className={styles.ringWins}>{wins}W</span>
        <span className={styles.ringDivider}>·</span>
        <span className={styles.ringLosses}>{losses}L</span>
      </div>
    </div>
  );
}

/** Score highlight bar */
function ScoreBar({ label, value, maxValue, glow }: { label: string; value: number; maxValue: number; glow?: boolean }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className={styles.scoreBar}>
      <div className={styles.scoreBarHeader}>
        <span className={`${styles.scoreBarLabel} ${glow ? styles.scoreBarLabelGlow : ""}`}>{label}</span>
        <span className={styles.scoreBarValue}>{value}</span>
      </div>
      <div className={styles.scoreBarTrack}>
        <div className={`${styles.scoreBarFill} ${glow ? styles.scoreBarFillGlow : ""}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StatisticsPage() {
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
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}><ChartPieIcon className="w-6 h-6" /> Statistics</h1>
          <p className={styles.subtitle}>Loading your performance data...</p>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalMatches === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}><ChartPieIcon className="w-6 h-6" /> Statistics</h1>
        </div>
        <div className={styles.emptyState}>
          <ChartPieIcon className={styles.emptyIcon} />
          <div className={styles.emptyTitle}>No matches yet</div>
          <div className={styles.emptySubtitle}>Play your first game and your stats will appear here!</div>
        </div>
      </div>
    );
  }

  const losses = stats.totalMatches - stats.totalWins;
  const maxHighlight = Math.max(stats.count100Plus, stats.count140Plus, stats.count180s, 1);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}><ChartPieIcon className="w-6 h-6" /> Statistics</h1>
        <p className={styles.subtitle}>
          Performance across {stats.totalMatches} match{stats.totalMatches !== 1 ? "es" : ""}
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className={styles.grid}>

        {/* Win Rate Ring */}
        <WinRateRing winRate={stats.winRate} wins={stats.totalWins} losses={losses} />

        {/* Key Numbers */}
        <div className={styles.numbersCard}>
          <div className={styles.numberItem}>
            <span className={styles.numberLabel}>Matches</span>
            <span className={styles.numberValue}>{stats.totalMatches}</span>
          </div>
          <div className={styles.numberDivider} />
          <div className={styles.numberItem}>
            <span className={styles.numberLabel}>Average</span>
            <span className={styles.numberValue}>{stats.overallAverage.toFixed(1)}</span>
          </div>
          <div className={styles.numberDivider} />
          <div className={styles.numberItem}>
            <span className={styles.numberLabel}>First 9 Avg</span>
            <span className={styles.numberValue}>{stats.first9Average.toFixed(1)}</span>
          </div>
          <div className={styles.numberDivider} />
          <div className={styles.numberItem}>
            <span className={styles.numberLabel}>Legs Won</span>
            <span className={styles.numberValue}>
              {stats.totalLegsWon}<span className={styles.numberUnit}> / {stats.totalLegs}</span>
            </span>
          </div>
        </div>

        {/* Score Highlights */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <FireIcon className="w-4 h-4" /> Score Highlights
          </div>
          <ScoreBar label="180s" value={stats.count180s} maxValue={maxHighlight} glow />
          <ScoreBar label="140+" value={stats.count140Plus} maxValue={maxHighlight} />
          <ScoreBar label="100+" value={stats.count100Plus} maxValue={maxHighlight} />
        </div>

        {/* Checkout & Records */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <TrophyIcon className="w-4 h-4" /> Records & Checkout
          </div>
          <div className={styles.recordRow}>
            <div className={styles.recordIcon}><TargetIcon className="w-4 h-4" /></div>
            <div className={styles.recordInfo}>
              <span className={styles.recordLabel}>Checkout %</span>
              <span className={styles.recordValue}>
                {stats.checkoutRate.toFixed(0)}%
                <span className={styles.numberUnit}> ({stats.totalCheckouts}/{stats.totalCheckoutAttempts})</span>
              </span>
            </div>
          </div>
          <div className={styles.recordRow}>
            <div className={styles.recordIcon}><SparklesIcon className="w-4 h-4" /></div>
            <div className={styles.recordInfo}>
              <span className={styles.recordLabel}>Highest Checkout</span>
              <span className={styles.recordValue}>{stats.highestCheckout || "—"}</span>
            </div>
          </div>
          <div className={styles.recordRow}>
            <div className={styles.recordIcon}><ZapIcon className="w-4 h-4" /></div>
            <div className={styles.recordInfo}>
              <span className={styles.recordLabel}>Best Leg</span>
              <span className={styles.recordValue}>{stats.bestLegDarts ? `${stats.bestLegDarts} darts` : "—"}</span>
            </div>
          </div>
          <div className={styles.recordRow}>
            <div className={styles.recordIcon}><CrownIcon className="w-4 h-4" /></div>
            <div className={styles.recordInfo}>
              <span className={styles.recordLabel}>Best Match Avg</span>
              <span className={styles.recordValue}>{stats.bestMatchAverage.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Streaks & Extra */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <FlameIcon className="w-4 h-4" /> Streaks & More
          </div>
          <div className={styles.miniGrid}>
            <div className={styles.miniStat}>
              <span className={styles.miniLabel}>Current Streak</span>
              <span className={styles.miniValue}>{stats.currentWinStreak}W</span>
            </div>
            <div className={styles.miniStat}>
              <span className={styles.miniLabel}>Longest Streak</span>
              <span className={styles.miniValue}>{stats.longestWinStreak}W</span>
            </div>
            <div className={styles.miniStat}>
              <span className={styles.miniLabel}>Total Busts</span>
              <span className={styles.miniValue}>{stats.totalBusts}</span>
            </div>
            <div className={styles.miniStat}>
              <span className={styles.miniLabel}>Highest Turn</span>
              <span className={styles.miniValue}>{stats.highestTurnScore}</span>
            </div>
            <div className={styles.miniStat}>
              <span className={styles.miniLabel}>Darts / Leg</span>
              <span className={styles.miniValue}>{stats.dartsPerLeg.toFixed(0)}</span>
            </div>
            <div className={styles.miniStat}>
              <span className={styles.miniLabel}>Total Darts</span>
              <span className={styles.miniValue}>{stats.totalDarts}</span>
            </div>
          </div>
        </div>

        {/* Players Faced */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            <UsersIcon className="w-4 h-4" /> Players Faced
          </div>
          <OpponentStats />
        </div>

        {/* Activity Heatmap — full width */}
        <div className={styles.fullWidthCard}>
          <div className={styles.cardLabel}>
            <CalendarDaysIcon className="w-4 h-4" /> Match Activity
          </div>
          <ActivityGraph />
        </div>

        {/* Match History — full width */}
        <div className={styles.fullWidthCard}>
          <div className={styles.cardLabel}><ClockIcon className="w-4 h-4" /> Match History</div>
          <HistoryList playerId={user?.id} />
        </div>
      </div>
    </div>
  );
}
