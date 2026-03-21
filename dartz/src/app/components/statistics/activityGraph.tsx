"use client";

import React, { useContext, useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from "react-tooltip";
import MatchService from "@/app/services/backend/matchService";
import { ActivityDay } from "@/app/utils/types";
import { UserContext } from "../userProvider/userProvider";
import styles from "../../styles/statistics.module.scss";

export default function ActivityGraph() {
  const context = useContext(UserContext);
  const user = context?.user;

  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const matchService = new MatchService();
    matchService
      .getActivityData(user.id)
      .then((res) => setActivity(res.data ?? []))
      .catch((err) => console.error("Failed to load activity:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const values = activity.map((a) => ({
    date: a.date,
    count: a.count,
  }));

  if (loading) {
    return <div className={styles.skeleton} style={{ height: 130 }} />;
  }

  return (
    <div className={styles.heatmapContainer}>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={(value: any) => {
          if (!value || value.count === 0) return "heatmap-empty";
          if (value.count <= 1) return "heatmap-l1";
          if (value.count <= 3) return "heatmap-l2";
          if (value.count <= 5) return "heatmap-l3";
          return "heatmap-l4";
        }}
        tooltipDataAttrs={(value: any) => {
          if (!value || !value.date) return { "data-tooltip-id": "heatmap-tip", "data-tooltip-content": "No matches" } as any;
          const d = new Date(value.date + "T00:00:00");
          const formatted = d.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          return {
            "data-tooltip-id": "heatmap-tip",
            "data-tooltip-content": `${formatted}: ${value.count} match${value.count !== 1 ? "es" : ""}`,
          } as any;
        }}
        showWeekdayLabels
        gutterSize={3}
      />
      <Tooltip id="heatmap-tip" />
    </div>
  );
}
