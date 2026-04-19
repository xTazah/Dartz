using System.Collections.Concurrent;

namespace Dartz.GameServer.Services;

public class LobbyInvite
{
    public string Key { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public string LobbyId { get; set; } = "";
    public int SenderUserId { get; set; }
    public string SenderUsername { get; set; } = "";
    public string? SenderProfilePicture { get; set; }
    public string SenderInitial { get; set; } = "";
}

public class FriendRequest
{
    public string Key { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public int SenderUserId { get; set; }
    public string SenderUsername { get; set; } = "";
}

public class InviteManager
{
    private readonly ConcurrentDictionary<int, List<LobbyInvite>> _lobbyInvites = new();
    private readonly ConcurrentDictionary<int, List<FriendRequest>> _friendRequests = new();

    public (bool added, LobbyInvite invite) AddLobbyInvite(int targetUserId, string lobbyId,
        int senderUserId, string senderUsername, string? senderProfilePicture, string senderInitial)
    {
        var invites = _lobbyInvites.GetOrAdd(targetUserId, _ => new List<LobbyInvite>());
        lock (invites)
        {
            if (invites.Any(i => i.LobbyId == lobbyId && i.SenderUserId == senderUserId))
                return (false, null!);

            var invite = new LobbyInvite
            {
                LobbyId = lobbyId,
                SenderUserId = senderUserId,
                SenderUsername = senderUsername,
                SenderProfilePicture = senderProfilePicture,
                SenderInitial = senderInitial,
            };
            invites.Add(invite);
            return (true, invite);
        }
    }

    public bool RemoveLobbyInvite(int userId, string key)
    {
        if (!_lobbyInvites.TryGetValue(userId, out var invites)) return false;
        lock (invites)
        {
            return invites.RemoveAll(i => i.Key == key) > 0;
        }
    }

    // Returns the (userId, key) pairs removed so callers can notify each recipient.
    public List<(int userId, string key)> RemoveInvitesForLobby(string lobbyId)
    {
        var removed = new List<(int, string)>();
        foreach (var (userId, invites) in _lobbyInvites)
        {
            lock (invites)
            {
                var matching = invites.Where(i => i.LobbyId == lobbyId).ToList();
                foreach (var invite in matching)
                {
                    invites.Remove(invite);
                    removed.Add((userId, invite.Key));
                }
            }
        }
        return removed;
    }

    public List<LobbyInvite> GetLobbyInvites(int userId)
    {
        if (!_lobbyInvites.TryGetValue(userId, out var invites))
            return new List<LobbyInvite>();
        lock (invites)
        {
            return invites.ToList();
        }
    }

    public (bool added, FriendRequest request) AddFriendRequest(int targetUserId,
        int senderUserId, string senderUsername)
    {
        var requests = _friendRequests.GetOrAdd(targetUserId, _ => new List<FriendRequest>());
        lock (requests)
        {
            if (requests.Any(r => r.SenderUserId == senderUserId))
                return (false, null!);

            var request = new FriendRequest
            {
                SenderUserId = senderUserId,
                SenderUsername = senderUsername,
            };
            requests.Add(request);
            return (true, request);
        }
    }

    public bool RemoveFriendRequest(int userId, string key)
    {
        if (!_friendRequests.TryGetValue(userId, out var requests)) return false;
        lock (requests)
        {
            return requests.RemoveAll(r => r.Key == key) > 0;
        }
    }

    public List<FriendRequest> GetFriendRequests(int userId)
    {
        if (!_friendRequests.TryGetValue(userId, out var requests))
            return new List<FriendRequest>();
        lock (requests)
        {
            return requests.ToList();
        }
    }
}
