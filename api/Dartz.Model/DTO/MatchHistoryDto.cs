namespace Dartz.Model.DTO
{
    /// <summary>
    /// Summary view of a match for the match history list.
    /// </summary>
    public class MatchHistoryDto
    {
        public int MatchId { get; set; }
        public string GameModeKey { get; set; } = string.Empty;
        public DateTime FinishedAt { get; set; }

        public string WinnerUsername { get; set; } = string.Empty;
        public int WinnerPlayerId { get; set; }

        public int Sets { get; set; }
        public int Legs { get; set; }

        public List<MatchHistoryPlayerDto> Players { get; set; } = new();
    }

    public class MatchHistoryPlayerDto
    {
        public int PlayerId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Initial { get; set; } = string.Empty;
        public int FinalSets { get; set; }
        public int FinalLegs { get; set; }
        public double Average { get; set; }
    }
}
