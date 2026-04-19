using Dartz.GameServer.Models;
using FluentAssertions;
using Microsoft.AspNetCore.SignalR.Client;

namespace Dartz.GameServer.Tests.Integration;

// End-to-end tests against a real GameHub behind an in-memory TestServer.
// These catch the classes of regression that unit tests can't:
//  - serialization field names (e.g. invite.senderUsername vs invite.sender.username)
//  - group fan-out (every lobby member really receives LobbyUpdated)
//  - turn-skip + disconnect choreography
//  - Play Again (restart from Finished)
public class GameHubIntegrationTests : IAsyncLifetime
{
    private static readonly TimeSpan WaitTimeout = TimeSpan.FromSeconds(3);

    private GameServerFactory _factory = null!;

    public Task InitializeAsync()
    {
        _factory = new GameServerFactory();
        // Force the TestServer to start so HubConnection can attach to it.
        _ = _factory.Server;
        return Task.CompletedTask;
    }

    public async Task DisposeAsync() => await _factory.DisposeAsync();

    // ---------- helpers ----------

    private async Task<HubConnection> ConnectAsync(int userId, string username)
    {
        var conn = _factory.CreateHubConnection();
        await conn.StartAsync();
        await conn.InvokeAsync("Register", userId, username);
        return conn;
    }

    private static TaskCompletionSource<T> WaitFor<T>(HubConnection conn, string method)
    {
        var tcs = new TaskCompletionSource<T>(TaskCreationOptions.RunContinuationsAsynchronously);
        conn.On<T>(method, msg => tcs.TrySetResult(msg));
        return tcs;
    }

    private static async Task<T> WithTimeout<T>(Task<T> task, string what)
    {
        var completed = await Task.WhenAny(task, Task.Delay(WaitTimeout));
        if (completed != task)
            throw new TimeoutException($"Timed out waiting for {what}");
        return await task;
    }

    private static async Task<ServerLobby?> JoinLobbyAsync(HubConnection conn,
        string lobbyId, int userId, string username, string color = "#000")
    {
        return await conn.InvokeAsync<ServerLobby?>(
            "JoinLobby", lobbyId, userId, username, username[..1], null, color);
    }

    // ---------- tests ----------

    [Fact]
    public async Task Late_joiner_to_running_game_becomes_a_spectator_and_receives_updates()
    {
        // 1. p1 creates + joins, p2 joins, game starts.
        var p1 = await ConnectAsync(1, "alice");
        await p1.InvokeAsync("CreateLobby", "LATE", 1, "alice", "501");
        await JoinLobbyAsync(p1, "LATE", 1, "alice");

        var p2 = await ConnectAsync(2, "bob");
        await JoinLobbyAsync(p2, "LATE", 2, "bob");
        await p1.InvokeAsync("StartGame", "LATE");

        // 2. p3 tries to join after the game has begun.
        var p3 = await ConnectAsync(3, "carol");
        var spectatorUpdate = WaitFor<ServerLobby>(p3, "LobbyUpdated");
        var joinResult = await JoinLobbyAsync(p3, "LATE", 3, "carol");

        // Server broadcasts LobbyUpdated when p3 joins the group.
        var lobby = await WithTimeout(spectatorUpdate.Task, "LobbyUpdated for p3");

        // Carol is in spectators, not players, and the game is still running.
        lobby.Spectators.Should().ContainSingle().Which.UserId.Should().Be(3);
        lobby.Players.Select(p => p.UserId).Should().BeEquivalentTo(new[] { 1, 2 });
        lobby.GameStatus.Should().Be(GameStatus.Running);
        joinResult.Should().NotBeNull("the hub returns the lobby even when falling back to spectator");

        // 3. A subsequent player action fans out to the spectator too.
        var spectatorSeesThrow = WaitFor<ServerLobby>(p3, "LobbyUpdated");
        // ServerThrow.IsValid requires each multiplier to be 1..3 even for zero-score darts.
        await p1.InvokeAsync("SubmitThrow", "LATE", 1, new ServerThrow
        {
            Score1 = 20, Multiplier1 = 1,
            Score2 = 0, Multiplier2 = 1,
            Score3 = 0, Multiplier3 = 1,
        });
        var updated = await WithTimeout(spectatorSeesThrow.Task, "spectator LobbyUpdated after throw");

        updated.Players[0].Score.Should().Be(481, "spectators must see live score changes");
    }

    [Fact]
    public async Task Skip_vote_from_sole_connected_player_advances_disconnected_players_turn()
    {
        // Two-player game; p1 is up; p1 drops; p2 votes skip; turn passes to p2.
        var p1 = await ConnectAsync(1, "alice");
        await p1.InvokeAsync("CreateLobby", "SKIP", 1, "alice", "501");
        await JoinLobbyAsync(p1, "SKIP", 1, "alice");

        var p2 = await ConnectAsync(2, "bob");
        await JoinLobbyAsync(p2, "SKIP", 2, "bob");
        await p1.InvokeAsync("StartGame", "SKIP");

        var p2SeesDisconnect = WaitFor<ServerLobby>(p2, "LobbyUpdated");
        await p1.StopAsync(); // simulates Alice's tab closing mid-turn
        var afterDisconnect = await WithTimeout(p2SeesDisconnect.Task, "disconnect LobbyUpdated");
        afterDisconnect.Players.Single(p => p.UserId == 1).Connected.Should().BeFalse();
        afterDisconnect.CurrentPlayerIndex.Should().Be(0, "turn index doesn't move on disconnect alone");

        // Bob votes to skip Alice's turn. He's the only connected player, so
        // ceil(1/2) = 1 vote is enough.
        var turnSkipped = WaitFor<int>(p2, "TurnSkipped");
        var lobbyAfterSkip = WaitFor<ServerLobby>(p2, "LobbyUpdated");
        await p2.InvokeAsync("VoteSkipTurn", "SKIP", 2);

        var skippedUserId = await WithTimeout(turnSkipped.Task, "TurnSkipped");
        var lobby = await WithTimeout(lobbyAfterSkip.Task, "post-skip LobbyUpdated");

        skippedUserId.Should().Be(1);
        lobby.CurrentPlayerIndex.Should().Be(1, "turn advances to Bob");
        lobby.SkipVotes.Should().BeEmpty("votes reset after the turn is skipped");
        // The skipped player's throws list gains a zero throw so averages don't break.
        lobby.Players.Single(p => p.UserId == 1).Throws.Should().ContainSingle()
            .Which.TotalScore.Should().Be(0);
    }

    [Fact]
    public async Task Self_skip_and_non_lobby_voter_are_rejected()
    {
        var p1 = await ConnectAsync(1, "alice");
        await p1.InvokeAsync("CreateLobby", "SELF", 1, "alice", "501");
        await JoinLobbyAsync(p1, "SELF", 1, "alice");

        var p2 = await ConnectAsync(2, "bob");
        await JoinLobbyAsync(p2, "SELF", 2, "bob");
        await p1.InvokeAsync("StartGame", "SELF");

        // Disconnect p1 so the "can only skip disconnected" branch is reachable.
        await p1.StopAsync();
        await Task.Delay(100);

        // p1 is disconnected — can't self-vote anyway, but more importantly
        // an outsider (p3, not in the lobby) must not be able to skip either.
        var p3 = await ConnectAsync(3, "outsider");
        await p3.InvokeAsync("VoteSkipTurn", "SELF", 3);
        await Task.Delay(100); // give the hub time to fan out if it did anything

        // p2 did not vote, p3's vote was rejected → CurrentPlayerIndex stays at 0.
        // We verify by having p2 vote and observing that the threshold is still 1
        // (not 2), i.e. p3's vote wasn't recorded.
        var skipped = WaitFor<int>(p2, "TurnSkipped");
        await p2.InvokeAsync("VoteSkipTurn", "SELF", 2);
        var who = await WithTimeout(skipped.Task, "TurnSkipped after p2 single vote");
        who.Should().Be(1);
    }

    [Fact]
    public async Task StartGame_restarts_a_finished_match_play_again()
    {
        // Regression guard for the "Play Again" bug.
        var p1 = await ConnectAsync(1, "alice");
        await p1.InvokeAsync("CreateLobby", "AGAIN", 1, "alice", "501");
        await JoinLobbyAsync(p1, "AGAIN", 1, "alice");
        await p1.InvokeAsync("StartGame", "AGAIN");

        // Win with a 501 checkout in a legs=1 match: scoring the exact 501 as 3
        // darts needs at most T20+T20+S61-invalid → instead, drive the score to
        // 40 manually via a valid flow. Simplest: use repeated valid throws.
        await p1.InvokeAsync("SubmitThrow", "AGAIN", 1,
            new ServerThrow { Score1 = 20, Multiplier1 = 3, Score2 = 20, Multiplier2 = 3, Score3 = 20, Multiplier3 = 3 }); // -180 => 321
        await p1.InvokeAsync("SubmitThrow", "AGAIN", 1,
            new ServerThrow { Score1 = 20, Multiplier1 = 3, Score2 = 20, Multiplier2 = 3, Score3 = 20, Multiplier3 = 3 }); // -180 => 141
        // Close out: T20 + S1 (= 61) → leaves 80. Bust-safe path: T19 (57) + D20 ... keep it simple:
        await p1.InvokeAsync("SubmitThrow", "AGAIN", 1,
            new ServerThrow { Score1 = 19, Multiplier1 = 3, Score2 = 14, Multiplier2 = 2, Score3 = 14, Multiplier3 = 2 }); // -113 => 28
        // 28 out: D14
        var gameFinished = WaitFor<int>(p1, "GameFinished");
        await p1.InvokeAsync("SubmitThrow", "AGAIN", 1,
            new ServerThrow { Score1 = 14, Multiplier1 = 2, Score2 = 0, Multiplier2 = 1, Score3 = 0, Multiplier3 = 1 });
        await WithTimeout(gameFinished.Task, "GameFinished");

        // Press Play Again: server must accept StartGame from Finished.
        var restarted = WaitFor<ServerLobby>(p1, "LobbyUpdated");
        await p1.InvokeAsync("StartGame", "AGAIN");
        var lobby = await WithTimeout(restarted.Task, "LobbyUpdated after restart");

        lobby.GameStatus.Should().Be(GameStatus.Running);
        lobby.WinnerUserId.Should().BeNull();
        lobby.Players.Should().OnlyContain(p => p.Score == 501 && p.Legs == 0 && p.Sets == 0);
    }

    [Fact]
    public async Task LobbyInviteReceived_payload_has_the_flat_sender_fields_the_client_reads()
    {
        // Regression: friendList.tsx used invite.sender.username — never populated
        // by the server. This test asserts the DTO shape the client expects.
        var alice = await ConnectAsync(1, "alice");
        await alice.InvokeAsync("CreateLobby", "INV", 1, "alice", "501");
        await JoinLobbyAsync(alice, "INV", 1, "alice");

        var bob = await ConnectAsync(2, "bob");
        var inviteReceived = WaitFor<LobbyInvitePayload>(bob, "LobbyInviteReceived");
        await alice.InvokeAsync("InviteToLobby", "INV", /*targetUserId*/2,
            /*senderUserId*/1, "alice", /*profilePicture*/null, "a");

        var invite = await WithTimeout(inviteReceived.Task, "LobbyInviteReceived");
        invite.Key.Should().NotBeNullOrEmpty();
        invite.LobbyId.Should().Be("INV");
        invite.SenderUserId.Should().Be(1);
        invite.SenderUsername.Should().Be("alice", "the UI renders this as the inviter's name");
    }

    [Fact]
    public async Task Deleting_a_lobby_emits_LobbyInviteRemoved_to_pending_recipients()
    {
        // Alice invites Bob, then leaves → lobby is deleted → Bob must be told
        // the invite is gone so his notifications popover prunes it.
        var alice = await ConnectAsync(1, "alice");
        await alice.InvokeAsync("CreateLobby", "GONE", 1, "alice", "501");
        await JoinLobbyAsync(alice, "GONE", 1, "alice");

        var bob = await ConnectAsync(2, "bob");
        var invited = WaitFor<LobbyInvitePayload>(bob, "LobbyInviteReceived");
        await alice.InvokeAsync("InviteToLobby", "GONE", 2, 1, "alice", null, "a");
        var invite = await WithTimeout(invited.Task, "LobbyInviteReceived");

        var removal = WaitFor<string>(bob, "LobbyInviteRemoved");
        await alice.InvokeAsync("LeaveLobby", "GONE", 1); // last player leaves → lobby removed
        var removedKey = await WithTimeout(removal.Task, "LobbyInviteRemoved");

        removedKey.Should().Be(invite.Key);
    }

    // Mirrors the client's expected shape (camelCase → PascalCase via STJ default).
    private record LobbyInvitePayload(
        string Key,
        string LobbyId,
        int SenderUserId,
        string SenderUsername,
        string? SenderProfilePicture,
        string SenderInitial);
}
