using Dartz.GameServer.Services;
using FluentAssertions;

namespace Dartz.GameServer.Tests;

public class PresenceTrackerTests
{
    [Fact]
    public void First_connection_for_user_reports_came_online()
    {
        var tracker = new PresenceTracker();

        tracker.UserConnected(userId: 1, connectionId: "a").Should().BeTrue();
        tracker.IsOnline(1).Should().BeTrue();
    }

    [Fact]
    public void Second_connection_from_same_user_does_not_refire_online()
    {
        // Opening a second tab should NOT re-broadcast UserOnline to everyone.
        var tracker = new PresenceTracker();
        tracker.UserConnected(1, "a");

        tracker.UserConnected(1, "b").Should().BeFalse();
    }

    [Fact]
    public void Disconnect_reports_went_offline_only_after_last_connection_closes()
    {
        var tracker = new PresenceTracker();
        tracker.UserConnected(1, "a");
        tracker.UserConnected(1, "b");

        tracker.UserDisconnected(1, "a").Should().BeFalse("other tab still open");
        tracker.IsOnline(1).Should().BeTrue();

        tracker.UserDisconnected(1, "b").Should().BeTrue("last connection gone");
        tracker.IsOnline(1).Should().BeFalse();
    }

    [Fact]
    public void GetUserIdByConnection_returns_user_until_they_disconnect()
    {
        var tracker = new PresenceTracker();
        tracker.UserConnected(42, "conn");

        tracker.GetUserIdByConnection("conn").Should().Be(42);

        tracker.UserDisconnected(42, "conn");
        tracker.GetUserIdByConnection("conn").Should().BeNull();
    }
}
