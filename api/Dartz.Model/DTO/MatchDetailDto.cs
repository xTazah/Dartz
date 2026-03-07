namespace Dartz.Model.DTO
{
    /// <summary>
    /// Full match detail for replay / detailed match view.
    /// Contains every throw so the game can be fully reconstructed.
    /// </summary>
    public class MatchDetailDto
    {
        public int MatchId { get; set; }
        public string GameModeKey { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Legs { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime FinishedAt { get; set; }

        public int WinnerPlayerId { get; set; }
        public string WinnerUsername { get; set; } = string.Empty;

        public List<MatchDetailPlayerDto> Players { get; set; } = new();
        public List<MatchDetailLegDto> MatchLegs { get; set; } = new();
    }

    public class MatchDetailPlayerDto
    {
        public int PlayerId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Initial { get; set; } = string.Empty;
        public int PlayerIndex { get; set; }
        public int FinalSets { get; set; }
        public int FinalLegs { get; set; }
    }

    public class MatchDetailLegDto
    {
        public int LegNumber { get; set; }
        public int? WinnerPlayerId { get; set; }
        public List<MatchDetailTurnDto> Turns { get; set; } = new();
    }

    public class MatchDetailTurnDto
    {
        public int TurnNumber { get; set; }
        public int PlayerId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int ScoreBefore { get; set; }
        public int ScoreAfter { get; set; }
        public int TotalPoints { get; set; }
        public bool IsBust { get; set; }
        public List<MatchDetailDartDto> Darts { get; set; } = new();
    }

    public class MatchDetailDartDto
    {
        public int DartNumber { get; set; }
        public int BaseScore { get; set; }
        public int Multiplier { get; set; }
    }
}
