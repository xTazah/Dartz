namespace Dartz.Model
{
    public class Leg
    {
        public int ID { get; set; }

        public int MatchID { get; set; }
        public virtual Match Match { get; set; } = null!;

        /// <summary>
        /// 1-based leg number within the match.
        /// </summary>
        public int LegNumber { get; set; }

        public int? WinnerPlayerID { get; set; }
        public virtual Player? WinnerPlayer { get; set; }

        public virtual ICollection<Turn> Turns { get; set; } = new List<Turn>();
    }
}
