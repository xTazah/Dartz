using System.Collections.Concurrent;
using Dartz.GameServer.Models;

namespace Dartz.GameServer.Services;

public class LobbyManager
{
    private readonly ConcurrentDictionary<string, ServerLobby> _lobbies = new();

    public ServerLobby CreateLobby(string lobbyId, int ownerUserId, string ownerUsername,
        string gameModeKey)
    {
        var lobby = new ServerLobby
        {
            Id = lobbyId,
            OwnerUserId = ownerUserId,
            OwnerUsername = ownerUsername,
            GameModeKey = gameModeKey,
        };
        _lobbies[lobbyId] = lobby;
        return lobby;
    }

    public ServerLobby? GetLobby(string lobbyId)
    {
        _lobbies.TryGetValue(lobbyId, out var lobby);
        return lobby;
    }

    public bool RemoveLobby(string lobbyId)
    {
        return _lobbies.TryRemove(lobbyId, out _);
    }

    public ServerPlayer? AddPlayer(ServerLobby lobby, int userId, string username,
        string initial, string? profilePicture, string dartColor, string connectionId)
    {
        var existing = lobby.Players.FirstOrDefault(p => p.UserId == userId);
        if (existing != null)
        {
            existing.Connected = true;
            existing.ConnectionId = connectionId;
            return existing;
        }

        if (lobby.GameStatus != GameStatus.Waiting)
            return null;

        var player = new ServerPlayer
        {
            UserId = userId,
            Username = username,
            Initial = initial,
            ProfilePicture = profilePicture,
            DartColor = dartColor,
            Score = 0,
            Connected = true,
            ConnectionId = connectionId,
        };
        lobby.Players.Add(player);
        return player;
    }

    public ConnectedSpectator AddSpectator(ServerLobby lobby, int userId, string username,
        string initial, string? profilePicture, string connectionId)
    {
        var existing = lobby.Spectators.FirstOrDefault(s => s.UserId == userId);
        if (existing != null)
        {
            existing.Connected = true;
            existing.ConnectionId = connectionId;
            return existing;
        }

        var spectator = new ConnectedSpectator
        {
            UserId = userId,
            Username = username,
            Initial = initial,
            ProfilePicture = profilePicture,
            Connected = true,
            ConnectionId = connectionId,
        };
        lobby.Spectators.Add(spectator);
        return spectator;
    }

    public void DisconnectPlayer(string connectionId)
    {
        foreach (var lobby in _lobbies.Values)
        {
            // Mark ALL players and spectators sharing this connectionId
            foreach (var player in lobby.Players.Where(p => p.ConnectionId == connectionId))
            {
                player.Connected = false;
                player.ConnectionId = null;
            }
            foreach (var spectator in lobby.Spectators.Where(s => s.ConnectionId == connectionId))
            {
                spectator.Connected = false;
                spectator.ConnectionId = null;
            }
        }
    }

    public (string? lobbyId, bool isSpectator) FindLobbyByConnection(string connectionId)
    {
        foreach (var lobby in _lobbies.Values)
        {
            if (lobby.Players.Any(p => p.ConnectionId == connectionId))
                return (lobby.Id, false);
            if (lobby.Spectators.Any(s => s.ConnectionId == connectionId))
                return (lobby.Id, true);
        }
        return (null, false);
    }

    public void RemovePlayer(ServerLobby lobby, int userId)
    {
        lobby.Players.RemoveAll(p => p.UserId == userId);
    }

    public void RemoveSpectator(ServerLobby lobby, int userId)
    {
        lobby.Spectators.RemoveAll(s => s.UserId == userId);
    }

    public List<string> CleanupStaleLobbies(TimeSpan timeout)
    {
        var stale = new List<string>();
        foreach (var (id, lobby) in _lobbies)
        {
            bool allDisconnected = lobby.Players.All(p => !p.Connected)
                && lobby.Spectators.All(s => !s.Connected);
            if (allDisconnected && DateTime.UtcNow - lobby.CreatedAt > timeout)
            {
                stale.Add(id);
            }
        }
        foreach (var id in stale)
            _lobbies.TryRemove(id, out _);
        return stale;
    }
}
