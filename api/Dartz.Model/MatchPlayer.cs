namespace Dartz.Model
{
    public class MatchPlayer
    {
        public int ID { get; set; }

        public int MatchID { get; set; }
        public virtual Match Match { get; set; } = null!;

        public int PlayerID { get; set; }
        public virtual Player Player { get; set; } = null!;

        /// <summary>
        /// The player's position/order in the match (0-based).
        /// </summary>
        public int PlayerIndex { get; set; }

        public int FinalSets { get; set; }
        public int FinalLegs { get; set; }

        public virtual ICollection<Turn> Turns { get; set; } = new List<Turn>();
    }
}
