using Dartz.GameServer.Services;
using FluentAssertions;

namespace Dartz.GameServer.Tests;

public class InviteManagerTests
{
    [Fact]
    public void AddLobbyInvite_deduplicates_same_sender_to_same_lobby()
    {
        var mgr = new InviteManager();

        var first = mgr.AddLobbyInvite(targetUserId: 10, lobbyId: "L1",
            senderUserId: 1, senderUsername: "alice", senderProfilePicture: null, senderInitial: "a");
        var second = mgr.AddLobbyInvite(targetUserId: 10, lobbyId: "L1",
            senderUserId: 1, senderUsername: "alice", senderProfilePicture: null, senderInitial: "a");

        first.added.Should().BeTrue();
        second.added.Should().BeFalse("a user cannot be spammed by the same sender for the same lobby");
        mgr.GetLobbyInvites(10).Should().ContainSingle();
    }

    [Fact]
    public void RemoveLobbyInvite_removes_only_the_matching_key()
    {
        var mgr = new InviteManager();
        var a = mgr.AddLobbyInvite(10, "L1", 1, "alice", null, "a").invite;
        var b = mgr.AddLobbyInvite(10, "L2", 2, "bob", null, "b").invite;

        var removed = mgr.RemoveLobbyInvite(10, a.Key);

        removed.Should().BeTrue();
        mgr.GetLobbyInvites(10).Should().ContainSingle().Which.Key.Should().Be(b.Key);
    }

    [Fact]
    public void RemoveInvitesForLobby_clears_all_recipients_and_returns_notifications()
    {
        // Regression test for the bug where deleting a lobby left dangling invites
        // in recipients' notification lists, pointing at a lobby that no longer existed.
        var mgr = new InviteManager();
        var i1 = mgr.AddLobbyInvite(10, "L1", 1, "alice", null, "a").invite;
        var i2 = mgr.AddLobbyInvite(11, "L1", 1, "alice", null, "a").invite;
        mgr.AddLobbyInvite(10, "L2", 1, "alice", null, "a"); // unrelated lobby, must survive

        var notifications = mgr.RemoveInvitesForLobby("L1");

        notifications.Should().BeEquivalentTo(new[]
        {
            (userId: 10, key: i1.Key),
            (userId: 11, key: i2.Key),
        });
        mgr.GetLobbyInvites(10).Should().ContainSingle().Which.LobbyId.Should().Be("L2");
        mgr.GetLobbyInvites(11).Should().BeEmpty();
    }

    [Fact]
    public void AddFriendRequest_deduplicates_by_sender()
    {
        var mgr = new InviteManager();

        var first = mgr.AddFriendRequest(10, senderUserId: 1, senderUsername: "alice");
        var second = mgr.AddFriendRequest(10, senderUserId: 1, senderUsername: "alice");

        first.added.Should().BeTrue();
        second.added.Should().BeFalse();
        mgr.GetFriendRequests(10).Should().ContainSingle();
    }
}
