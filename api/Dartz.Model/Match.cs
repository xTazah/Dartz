namespace Dartz.Model
{
    public class Match
    {
        public int ID { get; set; }
        public string GameModeKey { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Legs { get; set; }

        public int? WinnerPlayerID { get; set; }
        public virtual Player? WinnerPlayer { get; set; }

        public DateTime StartedAt { get; set; }
        public DateTime FinishedAt { get; set; }

        public virtual ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
        public virtual ICollection<Leg> MatchLegs { get; set; } = new List<Leg>();
    }
}
