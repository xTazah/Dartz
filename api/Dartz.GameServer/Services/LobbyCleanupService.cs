namespace Dartz.GameServer.Services;

public class LobbyCleanupService : BackgroundService
{
    private readonly LobbyManager _lobbies;
    private readonly ILogger<LobbyCleanupService> _logger;
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromSeconds(60);
    private static readonly TimeSpan StaleTimeout = TimeSpan.FromMinutes(5);

    public LobbyCleanupService(LobbyManager lobbies, ILogger<LobbyCleanupService> logger)
    {
        _lobbies = lobbies;
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
            }
        }
    }
}
