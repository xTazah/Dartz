using Microsoft.AspNetCore.SignalR;
using Dartz.GameServer.Hubs;

namespace Dartz.GameServer.Services;

public class LobbyCleanupService : BackgroundService
{
    private readonly LobbyManager _lobbies;
    private readonly InviteManager _invites;
    private readonly IHubContext<GameHub> _hub;
    private readonly ILogger<LobbyCleanupService> _logger;
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromSeconds(60);
    private static readonly TimeSpan StaleTimeout = TimeSpan.FromMinutes(5);

    public LobbyCleanupService(LobbyManager lobbies, InviteManager invites,
        IHubContext<GameHub> hub, ILogger<LobbyCleanupService> logger)
    {
        _lobbies = lobbies;
        _invites = invites;
        _hub = hub;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(CleanupInterval, stoppingToken);

            var removed = _lobbies.CleanupStaleLobbies(StaleTimeout);
            if (removed.Count > 0)
            {
                _logger.LogInformation("Cleaned up {Count} stale lobbies: {Ids}",
                    removed.Count, string.Join(", ", removed));

                // Purge invites for the removed lobbies and notify each recipient
                // so dangling invites stop pointing at lobbies that no longer exist.
                foreach (var lobbyId in removed)
                {
                    var purged = _invites.RemoveInvitesForLobby(lobbyId);
                    foreach (var (userId, key) in purged)
                    {
                        await _hub.Clients.Group($"user_{userId}")
                            .SendAsync("LobbyInviteRemoved", key, stoppingToken);
                    }
                }
            }
        }
    }
}
