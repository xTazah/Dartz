namespace Dartz.Model.DTO
{
    /// <summary>
    /// A single day's match activity (for GitHub-style heatmap).
    /// </summary>
    public class ActivityDayDto
    {
        public string Date { get; set; } = string.Empty; // "yyyy-MM-dd"
        public int Count { get; set; }
    }

    /// <summary>
    /// A single match data point for average-over-time trend chart.
    /// </summary>
    public class MatchTrendPointDto
    {
        public int MatchId { get; set; }
        public DateTime Date { get; set; }
        public double Average { get; set; }
        public bool Won { get; set; }
    }
}
