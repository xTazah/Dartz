using System.Text;
using System.Text.Json;
using Dartz.GameServer.Models;

namespace Dartz.GameServer.Services;

public class MatchSubmitter
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MatchSubmitter> _logger;

    public MatchSubmitter(HttpClient httpClient, ILogger<MatchSubmitter> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SubmitMatchAsync(ServerLobby lobby)
    {
        if (lobby.WinnerUserId == null) return;

        var payload = new
        {
            gameModeKey = lobby.GameModeKey,
            sets = lobby.TargetSets,
            legs = lobby.TargetLegs,
            winnerPlayerId = lobby.WinnerUserId.Value,
            startedAt = lobby.CreatedAt,
            finishedAt = DateTime.UtcNow,
            players = lobby.Players.Select((player, index) => new
            {
                playerId = player.UserId,
                playerIndex = index,
                finalSets = player.Sets,
                finalLegs = player.Legs,
                throws = player.Throws.Select(t => new
                {
                    score1 = t.Score1,
                    multiplier1 = t.Multiplier1,
                    score2 = t.Score2,
                    multiplier2 = t.Multiplier2,
                    score3 = t.Score3,
                    multiplier3 = t.Multiplier3,
                }).ToList()
            }).ToList()
        };

        try
        {
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/match", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Match saved for lobby {LobbyId}, winner: {WinnerId}",
                    lobby.Id, lobby.WinnerUserId);
            }
            else
            {
                _logger.LogError("Failed to save match for lobby {LobbyId}: {Status}",
                    lobby.Id, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting match for lobby {LobbyId}", lobby.Id);
        }
    }
}
