using Dartz.GameServer.Models;
using FluentAssertions;

namespace Dartz.GameServer.Tests;

public class GameModeLogicTests
{
    private static ServerLobby TwoPlayerLobby(int targetLegs = 1, int targetSets = 0)
    {
        var lobby = new ServerLobby
        {
            Id = "TEST",
            OwnerUserId = 1,
            OwnerUsername = "p1",
            TargetLegs = targetLegs,
            TargetSets = targetSets,
            Players =
            {
                new ServerPlayer { UserId = 1, Username = "p1" },
                new ServerPlayer { UserId = 2, Username = "p2" },
            },
        };
        GameModeLogic.Initialize501(lobby);
        return lobby;
    }

    private static ServerThrow Throw(int s1, int m1, int s2 = 0, int m2 = 1, int s3 = 0, int m3 = 1)
        => new() { Score1 = s1, Multiplier1 = m1, Score2 = s2, Multiplier2 = m2, Score3 = s3, Multiplier3 = m3 };

    [Fact]
    public void Initialize501_resets_players_and_sets_running()
    {
        var lobby = TwoPlayerLobby();
        lobby.Players[0].Score = 42;
        lobby.Players[0].Throws.Add(Throw(1, 1));
        lobby.Players[0].Legs = 3;
        lobby.GameStatus = GameStatus.Finished;

        GameModeLogic.Initialize501(lobby);

        lobby.Players.Should().OnlyContain(p =>
            p.Score == 501 && p.Throws.Count == 0 && p.Legs == 0 && p.Sets == 0);
        lobby.GameStatus.Should().Be(GameStatus.Running);
        lobby.WinnerUserId.Should().BeNull();
        lobby.CurrentPlayerIndex.Should().Be(0);
    }

    [Fact]
    public void Valid_throw_subtracts_score_and_advances_player()
    {
        var lobby = TwoPlayerLobby();

        var (result, updated) = GameModeLogic.ProcessTurn501(lobby, Throw(20, 3, 20, 3, 20, 3));

        result.Should().Be(TurnResult.Valid);
        updated.Players[0].Score.Should().Be(501 - 180);
        updated.Players[0].Throws.Should().ContainSingle();
        updated.CurrentPlayerIndex.Should().Be(1);
    }

    [Fact]
    public void Bust_on_negative_or_one_preserves_score_but_records_empty_throw()
    {
        var lobby = TwoPlayerLobby();
        lobby.Players[0].Score = 40; // any finish over 40 is bust except exactly 40

        var (result, updated) = GameModeLogic.ProcessTurn501(lobby, Throw(20, 3)); // 60 → newScore = -20

        result.Should().Be(TurnResult.Bust);
        updated.Players[0].Score.Should().Be(40, "bust preserves the pre-throw score");
        updated.Players[0].Throws.Should().ContainSingle()
            .Which.TotalScore.Should().Be(0, "a bust is persisted as a zero throw so statistics stay consistent");
        updated.CurrentPlayerIndex.Should().Be(1);
    }

    [Fact]
    public void Checkout_with_legs_only_finishes_match_on_target_legs()
    {
        var lobby = TwoPlayerLobby(targetLegs: 1, targetSets: 0);
        lobby.Players[0].Score = 40;

        var (result, updated) = GameModeLogic.ProcessTurn501(lobby, Throw(20, 2)); // 40 checkout

        result.Should().Be(TurnResult.GameFinished);
        updated.GameStatus.Should().Be(GameStatus.Finished);
        updated.WinnerUserId.Should().Be(1);
        updated.Players[0].Legs.Should().Be(1);
    }

    [Fact]
    public void Leg_won_in_sets_format_increments_sets_and_resets_legs_for_all()
    {
        var lobby = TwoPlayerLobby(targetLegs: 3, targetSets: 2);
        lobby.Players[0].Legs = 2; // one more leg wins the set
        lobby.Players[1].Legs = 1; // opponent had won one leg this set
        lobby.Players[0].Score = 40;

        var (result, updated) = GameModeLogic.ProcessTurn501(lobby, Throw(20, 2));

        result.Should().Be(TurnResult.LegWon);
        updated.GameStatus.Should().Be(GameStatus.Running);
        updated.Players[0].Sets.Should().Be(1);
        updated.Players[0].Legs.Should().Be(0);
        updated.Players[1].Legs.Should().Be(0, "legs reset for everyone when a new set begins");
        updated.Players.Should().OnlyContain(p => p.Score == 501);
    }

    [Fact]
    public void Leg_won_without_sets_format_does_not_reset_legs()
    {
        // Sets == 0 means "first to N legs" — crossing a leg boundary must not
        // reset counters here or the match never ends.
        var lobby = TwoPlayerLobby(targetLegs: 3, targetSets: 0);
        lobby.Players[0].Legs = 1;
        lobby.Players[0].Score = 40;

        var (result, updated) = GameModeLogic.ProcessTurn501(lobby, Throw(20, 2));

        result.Should().Be(TurnResult.LegWon);
        updated.Players[0].Legs.Should().Be(2);
        updated.Players[0].Sets.Should().Be(0);
    }

    [Fact]
    public void Checkout_on_bull_counts_as_double()
    {
        // The game logic itself doesn't enforce the "must finish on a double" rule,
        // but this regression test pins today's behaviour: a 50 checkout works.
        var lobby = TwoPlayerLobby();
        lobby.Players[0].Score = 50;

        var (result, updated) = GameModeLogic.ProcessTurn501(lobby, Throw(25, 2));

        result.Should().Be(TurnResult.GameFinished);
        updated.Players[0].Score.Should().Be(0);
    }
}
