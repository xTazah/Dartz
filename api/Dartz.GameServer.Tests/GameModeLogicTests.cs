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

    [Fact]
    public void Undo_restores_score_from_before_the_last_throw()
    {
        var lobby = TwoPlayerLobby();
        GameModeLogic.ProcessTurn501(lobby, Throw(20, 3, 20, 3, 20, 3)); // p1: 501 -> 321

        GameModeLogic.UndoLastTurn(lobby);

        lobby.CurrentPlayerIndex.Should().Be(0);
        lobby.Players[0].Score.Should().Be(501);
        lobby.Players[0].Throws.Should().BeEmpty();
    }

    [Fact]
    public void Undo_after_bust_keeps_score_unchanged()
    {
        var lobby = TwoPlayerLobby();
        lobby.Players[0].Score = 40;
        GameModeLogic.ProcessTurn501(lobby, Throw(20, 3)); // bust

        GameModeLogic.UndoLastTurn(lobby);

        lobby.Players[0].Score.Should().Be(40);
        lobby.Players[0].Throws.Should().BeEmpty();
    }
}

public class SequenceModeLogicTests
{
    private static ServerLobby SequenceLobby(string modeKey, int targetLegs = 1, int targetSets = 0)
    {
        var lobby = new ServerLobby
        {
            Id = "TEST",
            OwnerUserId = 1,
            OwnerUsername = "p1",
            GameModeKey = modeKey,
            TargetLegs = targetLegs,
            TargetSets = targetSets,
            Players =
            {
                new ServerPlayer { UserId = 1, Username = "p1" },
                new ServerPlayer { UserId = 2, Username = "p2" },
            },
        };
        GameModeLogic.Initialize(lobby);
        return lobby;
    }

    private static ServerThrow Throw(int s1, int m1, int s2 = 0, int m2 = 1, int s3 = 0, int m3 = 1)
        => new() { Score1 = s1, Multiplier1 = m1, Score2 = s2, Multiplier2 = m2, Score3 = s3, Multiplier3 = m3 };

    // ==================== AROUND THE CLOCK ====================

    [Fact]
    public void Atc_initialize_sets_target_to_1_for_all_players()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock);

        lobby.Players.Should().OnlyContain(p =>
            p.Score == 1 && p.Throws.Count == 0 && p.Legs == 0 && p.Sets == 0);
        lobby.GameStatus.Should().Be(GameStatus.Running);
    }

    [Fact]
    public void Atc_hitting_the_target_advances_by_one_regardless_of_multiplier()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock);

        // T1 hits target 1, then 2 hits target 2, third dart misses (5 while on 3)
        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(1, 3, 2, 1, 5, 1));

        result.Should().Be(TurnResult.Valid);
        updated.Players[0].Score.Should().Be(3);
        updated.Players[0].Throws.Should().ContainSingle();
        updated.CurrentPlayerIndex.Should().Be(1);
    }

    [Fact]
    public void Atc_misses_advance_nothing_but_record_the_throw()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock);

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(20, 1, 19, 1, 18, 1));

        result.Should().Be(TurnResult.Valid);
        updated.Players[0].Score.Should().Be(1);
        updated.Players[0].Throws.Should().ContainSingle();
    }

    [Fact]
    public void Atc_after_20_the_target_becomes_bull()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock);
        lobby.Players[0].Score = 20;

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(20, 1));

        result.Should().Be(TurnResult.Valid);
        updated.Players[0].Score.Should().Be(GameModeLogic.BullScore);
    }

    [Fact]
    public void Atc_hitting_bull_wins_the_leg_and_match()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock, targetLegs: 1);
        lobby.Players[0].Score = GameModeLogic.BullScore;

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(25, 1));

        result.Should().Be(TurnResult.GameFinished);
        updated.GameStatus.Should().Be(GameStatus.Finished);
        updated.WinnerUserId.Should().Be(1);
        updated.Players[0].Legs.Should().Be(1);
    }

    [Fact]
    public void Atc_can_finish_20_and_bull_within_one_throw()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock, targetLegs: 1);
        lobby.Players[0].Score = 19;

        var (result, _) = GameModeLogic.ProcessTurn(lobby, Throw(19, 1, 20, 1, 25, 2));

        result.Should().Be(TurnResult.GameFinished);
    }

    [Fact]
    public void Atc_leg_win_resets_targets_when_match_continues()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock, targetLegs: 2);
        lobby.Players[0].Score = GameModeLogic.BullScore;
        lobby.Players[1].Score = 14;

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(25, 1));

        result.Should().Be(TurnResult.LegWon);
        updated.GameStatus.Should().Be(GameStatus.Running);
        updated.Players.Should().OnlyContain(p => p.Score == 1);
        updated.Players[0].Legs.Should().Be(1);
    }

    [Fact]
    public void Atc_undo_restores_the_previous_target()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock);
        GameModeLogic.ProcessTurn(lobby, Throw(1, 1, 2, 1, 3, 1)); // p1 target 1 -> 4

        GameModeLogic.UndoLastTurn(lobby);

        lobby.CurrentPlayerIndex.Should().Be(0);
        lobby.Players[0].Score.Should().Be(1);
        lobby.Players[0].Throws.Should().BeEmpty();
    }

    // ==================== DOUBLE TRAINING ====================

    [Fact]
    public void Double_training_only_doubles_on_the_target_count()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeDoubleTraining);

        // Single 1 and T1 don't count, D1 does
        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(1, 1, 1, 3, 1, 2));

        result.Should().Be(TurnResult.Valid);
        updated.Players[0].Score.Should().Be(2);
    }

    [Fact]
    public void Double_training_sequence_advances_through_consecutive_doubles()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeDoubleTraining);

        var (_, updated) = GameModeLogic.ProcessTurn(lobby, Throw(1, 2, 2, 2, 3, 2));

        updated.Players[0].Score.Should().Be(4);
    }

    [Fact]
    public void Double_training_hitting_d20_wins_the_leg()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeDoubleTraining, targetLegs: 1);
        lobby.Players[0].Score = 20;

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(20, 2));

        result.Should().Be(TurnResult.GameFinished);
        updated.WinnerUserId.Should().Be(1);
    }

    [Fact]
    public void Double_training_single_20_on_target_20_does_not_win()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeDoubleTraining, targetLegs: 1);
        lobby.Players[0].Score = 20;

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(20, 1, 20, 3, 0, 1));

        result.Should().Be(TurnResult.Valid);
        updated.Players[0].Score.Should().Be(20);
        updated.GameStatus.Should().Be(GameStatus.Running);
    }

    [Fact]
    public void Double_training_set_format_works_like_501()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeDoubleTraining, targetLegs: 2, targetSets: 2);
        lobby.Players[0].Legs = 1; // one more leg wins the set
        lobby.Players[0].Score = 20;

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, Throw(20, 2));

        result.Should().Be(TurnResult.LegWon);
        updated.Players[0].Sets.Should().Be(1);
        updated.Players.Should().OnlyContain(p => p.Legs == 0 && p.Score == 1);
    }

    [Fact]
    public void Skip_turn_empty_throw_is_a_valid_no_op_for_sequence_modes()
    {
        var lobby = SequenceLobby(GameModeLogic.ModeAroundTheClock);
        lobby.Players[0].Score = 7;

        var (result, updated) = GameModeLogic.ProcessTurn(lobby, new ServerThrow());

        result.Should().Be(TurnResult.Valid);
        updated.Players[0].Score.Should().Be(7);
        updated.CurrentPlayerIndex.Should().Be(1);
    }
}
