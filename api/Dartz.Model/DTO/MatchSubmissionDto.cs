namespace Dartz.Model.DTO
{
    /// <summary>
    /// Payload sent from the frontend when a match finishes.
    /// Maps directly from the frontend Lobby state.
    /// </summary>
    public class MatchSubmissionDto
    {
        public string GameModeKey { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Legs { get; set; }
        public int WinnerPlayerId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime FinishedAt { get; set; }
        public List<MatchSubmissionPlayerDto> Players { get; set; } = new();
    }

    public class MatchSubmissionPlayerDto
    {
        public int PlayerId { get; set; }
        public int PlayerIndex { get; set; }
        public int FinalSets { get; set; }
        public int FinalLegs { get; set; }

        /// <summary>
        /// All throws from this player, in order.
        /// The service layer reconstructs leg boundaries from these.
        /// </summary>
        public List<MatchSubmissionThrowDto> Throws { get; set; } = new();
    }

    public class MatchSubmissionThrowDto
    {
        public int Score1 { get; set; }
        public int Multiplier1 { get; set; }
        public int Score2 { get; set; }
        public int Multiplier2 { get; set; }
        public int Score3 { get; set; }
        public int Multiplier3 { get; set; }
    }
}
