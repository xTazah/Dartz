using System.Collections.Concurrent;

namespace Dartz.GameServer.Services;

public class PresenceTracker
{
    private readonly ConcurrentDictionary<int, HashSet<string>> _connections = new();
    private readonly ConcurrentDictionary<string, int> _connectionToUser = new();

    public bool UserConnected(int userId, string connectionId)
    {
        _connectionToUser[connectionId] = userId;

        var connections = _connections.GetOrAdd(userId, _ => new HashSet<string>());
        lock (connections)
        {
            bool wasOffline = connections.Count == 0;
            connections.Add(connectionId);
            return wasOffline;
        }
    }

    public bool UserDisconnected(int userId, string connectionId)
    {
        _connectionToUser.TryRemove(connectionId, out _);

        if (!_connections.TryGetValue(userId, out var connections))
            return true;

        lock (connections)
        {
            connections.Remove(connectionId);
            return connections.Count == 0;
        }
    }

    public bool IsOnline(int userId)
    {
        if (!_connections.TryGetValue(userId, out var connections))
            return false;
        lock (connections)
        {
            return connections.Count > 0;
        }
    }

    public int? GetUserIdByConnection(string connectionId)
    {
        return _connectionToUser.TryGetValue(connectionId, out var userId)
            ? userId : null;
    }

    public List<string> GetConnectionIds(int userId)
    {
        if (!_connections.TryGetValue(userId, out var connections))
            return new List<string>();
        lock (connections)
        {
            return connections.ToList();
        }
    }
}
