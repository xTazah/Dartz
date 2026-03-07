namespace Dartz.Model
{
    /// <summary>
    /// Precomputed aggregate statistics for a player.
    /// Updated incrementally when a new match is submitted — avoids recalculating from raw data.
    /// </summary>
    public class PlayerStats
    {
        public int ID { get; set; }

        public int PlayerID { get; set; }
        public virtual Player Player { get; set; } = null!;

        // ── Match-level ──
        public int TotalMatches { get; set; }
        public int TotalWins { get; set; }

        // ── Leg-level ──
        public int TotalLegs { get; set; }
        public int TotalLegsWon { get; set; }

        // ── Turn-level ──
        public int TotalTurns { get; set; }
        public int TotalPoints { get; set; }
        public int TotalDarts { get; set; }

        /// <summary>
        /// Overall average points per turn = TotalPoints / TotalTurns.
        /// </summary>
        public double OverallAverage { get; set; }

        // ── Scoring highlights ──
        public int HighestTurnScore { get; set; }
        public int Count100Plus { get; set; }
        public int Count140Plus { get; set; }
        public int Count180s { get; set; }

        // ── Busts ──
        public int TotalBusts { get; set; }

        // ── Checkout stats ──
        /// <summary>
        /// Turns where ScoreBefore ≤ 170 (a finish was theoretically reachable).
        /// </summary>
        public int TotalCheckoutAttempts { get; set; }

        /// <summary>
        /// Turns where ScoreAfter == 0 (player checked out).
        /// </summary>
        public int TotalCheckouts { get; set; }

        /// <summary>
        /// Highest score on a checkout turn (where ScoreAfter == 0).
        /// </summary>
        public int HighestCheckout { get; set; }

        // ── Records ──
        /// <summary>
        /// Fewest number of darts (turns × 3) to close out a leg.
        /// </summary>
        public int? BestLegDarts { get; set; }

        /// <summary>
        /// Best per-match average ever achieved.
        /// </summary>
        public double BestMatchAverage { get; set; }

        /// <summary>
        /// Worst per-match average ever recorded.
        /// </summary>
        public double WorstMatchAverage { get; set; }

        // ── Streaks ──
        public int CurrentWinStreak { get; set; }
        public int LongestWinStreak { get; set; }

        // ── First 9 darts (opening 3 turns) ──
        public int TotalFirst9Turns { get; set; }
        public int TotalFirst9Points { get; set; }
        public double First9Average { get; set; }

        public DateTime? LastPlayedAt { get; set; }
    }
}
