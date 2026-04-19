using Dartz.GameServer.Models;
using Dartz.GameServer.Services;
using FluentAssertions;

namespace Dartz.GameServer.Tests;

public class LobbyManagerTests
{
    private static ServerLobby NewLobby(LobbyManager mgr, string id = "L1")
        => mgr.CreateLobby(id, ownerUserId: 1, ownerUsername: "owner", gameModeKey: "501");

    [Fact]
    public void CreateLobby_registers_the_lobby()
    {
        var mgr = new LobbyManager();

        var lobby = NewLobby(mgr);

        mgr.GetLobby("L1").Should().BeSameAs(lobby);
        lobby.GameStatus.Should().Be(GameStatus.Waiting);
    }

    [Fact]
    public void AddPlayer_reconnects_existing_player_instead_of_duplicating()
    {
        // Reconnection path: same user rejoins → flip Connected back on,
        // keep score/throws, do NOT append a second ServerPlayer.
        var mgr = new LobbyManager();
        var lobby = NewLobby(mgr);
        mgr.AddPlayer(lobby, userId: 42, username: "alice", initial: "a",
            profilePicture: null, dartColor: "#000", connectionId: "conn-1");
        lobby.Players[0].Connected = false;
        lobby.Players[0].Score = 123;

        var rejoined = mgr.AddPlayer(lobby, userId: 42, username: "alice", initial: "a",
            profilePicture: null, dartColor: "#000", connectionId: "conn-2");

        lobby.Players.Should().ContainSingle();
        rejoined.Should().NotBeNull();
        rejoined!.Connected.Should().BeTrue();
        rejoined.ConnectionId.Should().Be("conn-2");
        rejoined.Score.Should().Be(123, "reconnecting must not wipe match state");
    }

    [Fact]
    public void AddPlayer_refuses_new_joiners_once_game_has_started()
    {
        var mgr = new LobbyManager();
        var lobby = NewLobby(mgr);
        lobby.GameStatus = GameStatus.Running;

        var result = mgr.AddPlayer(lobby, 99, "latecomer", "l", null, "#000", "c1");

        result.Should().BeNull("returning null tells the hub to add them as a spectator instead");
        lobby.Players.Should().BeEmpty();
    }

    [Fact]
    public void DisconnectPlayer_marks_matching_connection_across_all_lobbies()
    {
        var mgr = new LobbyManager();
        var lobbyA = NewLobby(mgr, "A");
        var lobbyB = NewLobby(mgr, "B");
        mgr.AddPlayer(lobbyA, 1, "x", "x", null, "#000", "shared-conn");
        mgr.AddPlayer(lobbyB, 1, "x", "x", null, "#000", "shared-conn");

        mgr.DisconnectPlayer("shared-conn");

        lobbyA.Players[0].Connected.Should().BeFalse();
        lobbyB.Players[0].Connected.Should().BeFalse();
    }

    [Fact]
    public void CleanupStaleLobbies_removes_old_fully_disconnected_lobbies_only()
    {
        var mgr = new LobbyManager();
        var old = NewLobby(mgr, "old");
        var young = NewLobby(mgr, "young");
        var active = NewLobby(mgr, "active");

        // Backdate two lobbies; put a connected player in "active" so it isn't eligible.
        old.CreatedAt = DateTime.UtcNow - TimeSpan.FromHours(1);
        young.CreatedAt = DateTime.UtcNow;
        active.CreatedAt = DateTime.UtcNow - TimeSpan.FromHours(1);
        mgr.AddPlayer(active, 1, "x", "x", null, "#000", "c1"); // Connected = true

        var removed = mgr.CleanupStaleLobbies(TimeSpan.FromMinutes(5));

        removed.Should().BeEquivalentTo(new[] { "old" });
        mgr.GetLobby("young").Should().NotBeNull("not old enough to be stale");
        mgr.GetLobby("active").Should().NotBeNull("still has a connected player");
        mgr.GetLobby("old").Should().BeNull();
    }
}
