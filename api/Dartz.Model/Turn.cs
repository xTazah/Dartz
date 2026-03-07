namespace Dartz.Model
{
    public class Turn
    {
        public int ID { get; set; }

        public int LegID { get; set; }
        public virtual Leg Leg { get; set; } = null!;

        public int MatchPlayerID { get; set; }
        public virtual MatchPlayer MatchPlayer { get; set; } = null!;

        /// <summary>
        /// 1-based turn number within the leg.
        /// </summary>
        public int TurnNumber { get; set; }

        /// <summary>
        /// Player's score before this turn (e.g., 501, 320, etc.)
        /// </summary>
        public int ScoreBefore { get; set; }

        /// <summary>
        /// Player's score after this turn.
        /// </summary>
        public int ScoreAfter { get; set; }

        /// <summary>
        /// Total points scored in this turn (sum of 3 darts × multipliers).
        /// </summary>
        public int TotalPoints { get; set; }

        /// <summary>
        /// Whether this turn was a bust (score went below 0 or to 1).
        /// </summary>
        public bool IsBust { get; set; }

        public virtual ICollection<Dart> Darts { get; set; } = new List<Dart>();
    }
}
