namespace Dartz.Model.DTO
{
    public class OpponentStatsDto
    {
        public int OpponentPlayerId { get; set; }
        public string OpponentUsername { get; set; } = string.Empty;
        public string OpponentInitial { get; set; } = string.Empty;
        public int MatchesPlayed { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public double WinRate { get; set; }
        public DateTime? LastPlayedAt { get; set; }
    }
}
