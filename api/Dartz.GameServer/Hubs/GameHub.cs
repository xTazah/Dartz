using Microsoft.AspNetCore.SignalR;
using Dartz.GameServer.Models;
using Dartz.GameServer.Services;

namespace Dartz.GameServer.Hubs;

public class GameHub : Hub
{
    private readonly LobbyManager _lobbies;
    private readonly PresenceTracker _presence;
    private readonly InviteManager _invites;

    public GameHub(LobbyManager lobbies, PresenceTracker presence, InviteManager invites)
    {
        _lobbies = lobbies;
        _presence = presence;
        _invites = invites;
    }

    // ==================== CONNECTION LIFECYCLE ====================

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public async Task Register(int userId, string username)
    {
        bool cameOnline = _presence.UserConnected(userId, Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

        if (cameOnline)
        {
            await Clients.All.SendAsync("UserOnline", userId);
        }

        var invites = _invites.GetLobbyInvites(userId);
        var requests = _invites.GetFriendRequests(userId);
        await Clients.Caller.SendAsync("PendingInvites", invites);
        await Clients.Caller.SendAsync("PendingFriendRequests", requests);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _presence.GetUserIdByConnection(Context.ConnectionId);

        // Find the lobby BEFORE clearing the connection
        var (lobbyId, _) = _lobbies.FindLobbyByConnection(Context.ConnectionId);

        if (userId.HasValue)
        {
            bool wentOffline = _presence.UserDisconnected(userId.Value, Context.ConnectionId);

            // Mark as disconnected (does NOT remove from lobby)
            _lobbies.DisconnectPlayer(Context.ConnectionId);

            // Notify remaining lobby members
            if (lobbyId != null)
            {
                var lobby = _lobbies.GetLobby(lobbyId);
                if (lobby != null)
                    await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
            }

            if (wentOffline)
            {
                await Clients.All.SendAsync("UserOffline", userId.Value);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    // ==================== PRESENCE ====================

    public bool GetOnlineStatus(int userId)
    {
        return _presence.IsOnline(userId);
    }

    public Dictionary<int, bool> GetBulkOnlineStatus(int[] userIds)
    {
        return userIds.ToDictionary(id => id, id => _presence.IsOnline(id));
    }

    // ==================== LOBBY MANAGEMENT ====================

    public Task<bool> CheckLobbyExists(string lobbyId)
    {
        return Task.FromResult(_lobbies.GetLobby(lobbyId) != null);
    }

    public async Task<ServerLobby> CreateLobby(string lobbyId, int ownerUserId,
        string ownerUsername, string gameModeKey)
    {
        var lobby = _lobbies.CreateLobby(lobbyId, ownerUserId, ownerUsername, gameModeKey);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{lobbyId}");
        return lobby;
    }

    public async Task<ServerLobby?> JoinLobby(string lobbyId, int userId, string username,
        string initial, string? profilePicture, string dartColor)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return null;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{lobbyId}");

        var player = _lobbies.AddPlayer(lobby, userId, username, initial,
            profilePicture, dartColor, Context.ConnectionId);

        if (player == null)
        {
            _lobbies.AddSpectator(lobby, userId, username, initial,
                profilePicture, Context.ConnectionId);
        }

        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
        return lobby;
    }

    public async Task LeaveLobby(string lobbyId, int userId)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;

        _lobbies.RemovePlayer(lobby, userId);
        _lobbies.RemoveSpectator(lobby, userId);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"lobby_{lobbyId}");
        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);

        if (lobby.Players.Count == 0 && lobby.Spectators.Count == 0)
        {
            _lobbies.RemoveLobby(lobbyId);
        }
    }

    public async Task ChangeGameMode(string lobbyId, string gameModeKey)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;
        lobby.GameModeKey = gameModeKey;
        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
    }

    public async Task ChangeSetsAndLegs(string lobbyId, int sets, int legs)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;
        lobby.TargetSets = sets;
        lobby.TargetLegs = legs;
        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
    }

    // ==================== GAME ACTIONS ====================

    public async Task StartGame(string lobbyId)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;
        if (lobby.GameStatus != GameStatus.Waiting) return;

        // Apply default: if no match format configured, play single legs (first to 1)
        if (lobby.TargetSets == 0 && lobby.TargetLegs == 0)
        {
            lobby.TargetLegs = 1;
        }

        GameModeLogic.Initialize501(lobby);
        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
    }

    public async Task SubmitThrow(string lobbyId, int userId, ServerThrow dartThrow)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;
        if (lobby.GameStatus != GameStatus.Running) return;

        var currentPlayer = lobby.Players[lobby.CurrentPlayerIndex];
        if (currentPlayer.UserId != userId) return;

        if (!dartThrow.IsValid()) return;

        var (result, updatedLobby) = GameModeLogic.ProcessTurn501(lobby, dartThrow);
        updatedLobby.CurrentTurnDarts = null;
        updatedLobby.SkipVotes.Clear();

        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", updatedLobby);

        if (result == TurnResult.GameFinished)
        {
            await Clients.Group($"lobby_{lobbyId}").SendAsync("GameFinished",
                updatedLobby.WinnerUserId);
        }
    }

    public async Task UndoTurn(string lobbyId, int requestingUserId)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;
        if (lobby.OwnerUserId != requestingUserId) return;
        if (lobby.GameStatus != GameStatus.Running) return;

        int playerCount = lobby.Players.Count;
        lobby.CurrentPlayerIndex = (lobby.CurrentPlayerIndex - 1 + playerCount) % playerCount;

        var player = lobby.Players[lobby.CurrentPlayerIndex];
        if (player.Throws.Count > 0)
        {
            var lastThrow = player.Throws[^1];
            player.Throws.RemoveAt(player.Throws.Count - 1);
            player.Score += lastThrow.TotalScore;
        }

        lobby.SkipVotes.Clear();
        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
    }

    public async Task SyncDartPositions(string lobbyId, int playerId,
        List<DartPosition> darts)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;

        lobby.CurrentTurnDarts = new CurrentTurnDarts
        {
            PlayerId = playerId,
            Darts = darts,
        };

        await Clients.OthersInGroup($"lobby_{lobbyId}")
            .SendAsync("DartPositionsUpdated", playerId, darts);
    }

    public async Task DisconnectFromLobby(string lobbyId, int userId)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;

        var player = lobby.Players.FirstOrDefault(p => p.UserId == userId);
        if (player != null)
        {
            player.Connected = false;
            player.ConnectionId = null;
        }

        var spectator = lobby.Spectators.FirstOrDefault(s => s.UserId == userId);
        if (spectator != null)
        {
            spectator.Connected = false;
            spectator.ConnectionId = null;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"lobby_{lobbyId}");
        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
    }

    public async Task VoteSkipTurn(string lobbyId, int voterUserId)
    {
        var lobby = _lobbies.GetLobby(lobbyId);
        if (lobby == null) return;
        if (lobby.GameStatus != GameStatus.Running) return;

        var currentPlayer = lobby.Players[lobby.CurrentPlayerIndex];
        // Can only skip a disconnected player
        if (currentPlayer.Connected) return;
        // Voter must be a connected player in this lobby
        if (!lobby.Players.Any(p => p.UserId == voterUserId && p.Connected)) return;
        // Can't vote to skip yourself
        if (currentPlayer.UserId == voterUserId) return;

        lobby.SkipVotes.Add(voterUserId);

        // Count connected players (excluding the disconnected one)
        int connectedCount = lobby.Players.Count(p => p.Connected && p.UserId != currentPlayer.UserId);
        int votesNeeded = (int)Math.Ceiling(connectedCount / 2.0);

        if (lobby.SkipVotes.Count >= votesNeeded)
        {
            // Skip turn: submit an empty throw
            var emptyThrow = new ServerThrow();
            var (result, updatedLobby) = GameModeLogic.ProcessTurn501(lobby, emptyThrow);
            updatedLobby.SkipVotes.Clear();
            updatedLobby.CurrentTurnDarts = null;

            await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", updatedLobby);
            await Clients.Group($"lobby_{lobbyId}").SendAsync("TurnSkipped", currentPlayer.UserId);

            if (result == TurnResult.GameFinished)
            {
                await Clients.Group($"lobby_{lobbyId}").SendAsync("GameFinished", updatedLobby.WinnerUserId);
            }
        }
        else
        {
            // Notify all clients about the vote progress
            await Clients.Group($"lobby_{lobbyId}").SendAsync("SkipVoteUpdate", lobby.SkipVotes.Count, votesNeeded);
            await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
        }
    }

    // ==================== INVITES & FRIEND REQUESTS ====================

    public async Task InviteToLobby(string lobbyId, int targetUserId,
        int senderUserId, string senderUsername, string? senderProfilePicture,
        string senderInitial)
    {
        var (added, invite) = _invites.AddLobbyInvite(targetUserId, lobbyId,
            senderUserId, senderUsername, senderProfilePicture, senderInitial);

        if (added)
        {
            await Clients.Group($"user_{targetUserId}")
                .SendAsync("LobbyInviteReceived", invite);
        }
    }

    public async Task ClearLobbyInvite(int userId, string key)
    {
        _invites.RemoveLobbyInvite(userId, key);
    }

    public async Task SendFriendRequest(int targetUserId, int senderUserId,
        string senderUsername)
    {
        var (added, request) = _invites.AddFriendRequest(targetUserId,
            senderUserId, senderUsername);

        if (added)
        {
            await Clients.Group($"user_{targetUserId}")
                .SendAsync("FriendRequestReceived", request);
        }
    }

    public async Task ClearFriendRequest(int userId, string key)
    {
        _invites.RemoveFriendRequest(userId, key);
    }
}
