"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/matchHistory.module.scss";
import MatchService from "@/app/services/backend/matchService";
import { MatchHistoryEntry } from "@/app/utils/types";
import HistoryItem from "./historyItem";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";

interface HistoryListProps {
  playerId?: number;
  compact?: boolean; // For dashboard embed
  limit?: number; // Max items for dashboard
}

export default function HistoryList({
  playerId,
  compact = false,
  limit,
}: HistoryListProps) {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = limit ?? 10;

  useEffect(() => {
    if (!playerId) return;

    setLoading(true);
    const matchService = new MatchService();
    matchService
      .getMatchHistory(playerId, 1, pageSize)
      .then((res) => {
        const data = res.data ?? [];
        setHistory(data);
        setHasMore(data.length === pageSize);
        setPage(1);
      })
      .catch((err) => console.error("Failed to load match history:", err))
      .finally(() => setLoading(false));
  }, [playerId, pageSize]);

  const loadMore = async () => {
    if (!playerId || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const matchService = new MatchService();
    try {
      const res = await matchService.getMatchHistory(
        playerId,
        nextPage,
        pageSize
      );
      const data = res.data ?? [];
      setHistory((prev) => [...prev, ...data]);
      setHasMore(data.length === pageSize);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to load more history:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.list} ${compact ? styles.compact : ""}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.loadingSkeleton} />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={styles.emptyHistory}>
        <ClockIcon className={styles.emptyHistoryIcon} />
        <span>No matches played yet</span>
      </div>
    );
  }

  return (
    <div className={`${styles.historySection} ${compact ? styles.compact : ""}`}>
      <div className={styles.list}>
        {history.map((match) => (
          <HistoryItem key={match.matchId} match={match} playerId={playerId!} />
        ))}
      </div>

      {!compact && hasMore && (
        <button
          className={styles.loadMoreButton}
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Load more"
          )}
        </button>
      )}
    </div>
  );
}
