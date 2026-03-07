namespace Dartz.Model.DTO
{
    /// <summary>
    /// Precomputed player statistics returned by the API.
    /// </summary>
    public class PlayerStatsDto
    {
        public int PlayerId { get; set; }
        public string Username { get; set; } = string.Empty;

        // ── Match stats ──
        public int TotalMatches { get; set; }
        public int TotalWins { get; set; }
        public double WinRate { get; set; }

        // ── Leg stats ──
        public int TotalLegs { get; set; }
        public int TotalLegsWon { get; set; }

        // ── Scoring stats ──
        public double OverallAverage { get; set; }
        public int TotalDarts { get; set; }
        public int HighestTurnScore { get; set; }
        public int Count100Plus { get; set; }
        public int Count140Plus { get; set; }
        public int Count180s { get; set; }

        // ── Busts ──
        public int TotalBusts { get; set; }

        // ── Checkout stats ──
        public int TotalCheckoutAttempts { get; set; }
        public int TotalCheckouts { get; set; }
        public double CheckoutRate { get; set; } // Computed: TotalCheckouts / TotalCheckoutAttempts * 100
        public int HighestCheckout { get; set; }

        // ── Records ──
        public int? BestLegDarts { get; set; }
        public double BestMatchAverage { get; set; }
        public double WorstMatchAverage { get; set; }

        // ── Streaks ──
        public int CurrentWinStreak { get; set; }
        public int LongestWinStreak { get; set; }

        // ── First 9 darts ──
        public double First9Average { get; set; }

        // ── Derived ──
        public double DartsPerLeg { get; set; } // Computed: TotalDarts / TotalLegsWon

        public DateTime? LastPlayedAt { get; set; }
    }
}
