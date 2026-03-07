using Dartz.Model.DTO;
using Dartz.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Dartz_API.Controllers
{
    [ApiController]
    [Route("match")]
    public class MatchController : ControllerBase
    {
        private readonly ILogger<MatchController> _logger;
        private readonly IMatchService _matchService;

        public MatchController(ILogger<MatchController> logger, IMatchService matchService)
        {
            _logger = logger;
            _matchService = matchService;
        }

        /// <summary>
        /// Submit a completed match for historization.
        /// Called by the lobby owner's client when a game finishes.
        /// </summary>
        [HttpPost("")]
        public async Task<ActionResult> SubmitMatch([FromBody] MatchSubmissionDto submission)
        {
            try
            {
                var match = await _matchService.SubmitMatch(submission);
                return Ok(new { matchId = match.ID });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting match");
                return StatusCode(500, new { error = "Failed to save match" });
            }
        }

        /// <summary>
        /// Get paginated match history for a player.
        /// </summary>
        [HttpGet("history/{playerId}")]
        public async Task<ActionResult> GetMatchHistory(int playerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var history = await _matchService.GetMatchHistory(playerId, page, pageSize);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching match history for player {PlayerId}", playerId);
                return StatusCode(500, new { error = "Failed to fetch match history" });
            }
        }

        /// <summary>
        /// Get full match detail (all legs, turns, darts) for replay.
        /// </summary>
        [HttpGet("{matchId}")]
        public async Task<ActionResult> GetMatchDetail(int matchId)
        {
            try
            {
                var detail = await _matchService.GetMatchDetail(matchId);
                if (detail == null) return NotFound(new { error = "Match not found" });
                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching match detail for match {MatchId}", matchId);
                return StatusCode(500, new { error = "Failed to fetch match detail" });
            }
        }

        /// <summary>
        /// Get precomputed player statistics.
        /// </summary>
        [HttpGet("stats/{playerId}")]
        public async Task<ActionResult> GetPlayerStats(int playerId)
        {
            try
            {
                var stats = await _matchService.GetPlayerStats(playerId);
                if (stats == null) return NotFound(new { error = "No stats found for player" });
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching stats for player {PlayerId}", playerId);
                return StatusCode(500, new { error = "Failed to fetch player stats" });
            }
        }
        /// <summary>
        /// Get head-to-head stats against all opponents for a player.
        /// </summary>
        [HttpGet("opponents/{playerId}")]
        public async Task<ActionResult> GetOpponentStats(int playerId)
        {
            try
            {
                var opponents = await _matchService.GetOpponentStats(playerId);
                return Ok(opponents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching opponent stats for player {PlayerId}", playerId);
                return StatusCode(500, new { error = "Failed to fetch opponent stats" });
            }
        }
        /// <summary>
        /// Get match activity per date (for GitHub-style heatmap).
        /// </summary>
        [HttpGet("analytics/activity/{playerId}")]
        public async Task<ActionResult> GetActivityData(int playerId)
        {
            try
            {
                var activity = await _matchService.GetActivityData(playerId);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching activity data for player {PlayerId}", playerId);
                return StatusCode(500, new { error = "Failed to fetch activity data" });
            }
        }

        /// <summary>
        /// Get per-match average trends over time.
        /// </summary>
        [HttpGet("analytics/trends/{playerId}")]
        public async Task<ActionResult> GetMatchTrends(int playerId)
        {
            try
            {
                var trends = await _matchService.GetMatchTrends(playerId);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching match trends for player {PlayerId}", playerId);
                return StatusCode(500, new { error = "Failed to fetch match trends" });
            }
        }
    }
}
