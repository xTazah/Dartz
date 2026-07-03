namespace Dartz.GameServer.Models;

public enum TurnResult { Valid, Bust, LegWon, GameFinished }

public static class GameModeLogic
{
    public const string Mode501 = "501";
    public const string ModeAroundTheClock = "around-the-clock";
    public const string ModeDoubleTraining = "double-training";

    public const int BullScore = 25;

    // ==================== DISPATCH ====================

    public static void Initialize(ServerLobby lobby)
    {
        foreach (var player in lobby.Players)
        {
            player.Score = GetStartingScore(lobby.GameModeKey);
            player.Throws.Clear();
            player.Legs = 0;
            player.Sets = 0;
        }
        lobby.CurrentPlayerIndex = 0;
        lobby.GameStatus = GameStatus.Running;
        lobby.WinnerUserId = null;
    }

    public static (TurnResult result, ServerLobby lobby) ProcessTurn(
        ServerLobby lobby, ServerThrow dartThrow)
    {
        return lobby.GameModeKey switch
        {
            // Targets 1-20 in order, then Bull. Any multiplier counts.
            ModeAroundTheClock => ProcessTurnSequence(lobby, dartThrow,
                doublesOnly: false, endWithBull: true),
            // Doubles D1-D20 in order. Only doubles on the target count.
            ModeDoubleTraining => ProcessTurnSequence(lobby, dartThrow,
                doublesOnly: true, endWithBull: false),
            _ => ProcessTurn501(lobby, dartThrow),
        };
    }

    /// <summary>
    /// Undoes the last submitted turn: steps back to the previous player,
    /// removes their last throw and restores their score from before that throw.
    /// Works for all game modes because every processed throw records ScoreBefore.
    /// </summary>
    public static void UndoLastTurn(ServerLobby lobby)
    {
        int playerCount = lobby.Players.Count;
        if (playerCount == 0) return;

        lobby.CurrentPlayerIndex =
            (lobby.CurrentPlayerIndex - 1 + playerCount) % playerCount;

        var player = lobby.Players[lobby.CurrentPlayerIndex];
        if (player.Throws.Count > 0)
        {
            var lastThrow = player.Throws[^1];
            player.Throws.RemoveAt(player.Throws.Count - 1);
            player.Score = lastThrow.ScoreBefore;
        }
    }

    public static int GetStartingScore(string gameModeKey) => gameModeKey switch
    {
        ModeAroundTheClock or ModeDoubleTraining => 1,
        _ => 501,
    };

    // ==================== 501 ====================

    public static (TurnResult result, ServerLobby lobby) ProcessTurn501(
        ServerLobby lobby, ServerThrow dartThrow)
    {
        var player = lobby.Players[lobby.CurrentPlayerIndex];
        dartThrow.ScoreBefore = player.Score;
        int newScore = player.Score - dartThrow.TotalScore;

        if (newScore == 0)
        {
            player.Score = 0;
            player.Throws.Add(dartThrow);
            return HandleLegWin(lobby, player);
        }
        else if (newScore < 0 || newScore == 1)
        {
            player.Throws.Add(new ServerThrow { ScoreBefore = player.Score });
            AdvancePlayer(lobby);
            return (TurnResult.Bust, lobby);
        }
        else
        {
            player.Score = newScore;
            player.Throws.Add(dartThrow);
            AdvancePlayer(lobby);
            return (TurnResult.Valid, lobby);
        }
    }

    public static void Initialize501(ServerLobby lobby)
    {
        // Kept for backwards compatibility; Initialize() is mode-aware.
        foreach (var player in lobby.Players)
        {
            player.Score = 501;
            player.Throws.Clear();
            player.Legs = 0;
            player.Sets = 0;
        }
        lobby.CurrentPlayerIndex = 0;
        lobby.GameStatus = GameStatus.Running;
        lobby.WinnerUserId = null;
    }

    // ==================== SEQUENCE MODES (Around the Clock / Double Training) ====================

    // Player.Score holds the current target: 1..20, then 25 (= Bull) if endWithBull.
    private static (TurnResult result, ServerLobby lobby) ProcessTurnSequence(
        ServerLobby lobby, ServerThrow dartThrow, bool doublesOnly, bool endWithBull)
    {
        var player = lobby.Players[lobby.CurrentPlayerIndex];
        dartThrow.ScoreBefore = player.Score;

        int target = player.Score;
        bool completed = false;

        foreach (var (score, multiplier) in dartThrow.GetDarts())
        {
            if (completed) break;

            bool hit = doublesOnly
                ? score == target && multiplier == 2
                : score == target;
            if (!hit) continue;

            if (target == 20)
            {
                if (endWithBull) target = BullScore;
                else completed = true;
            }
            else if (target == BullScore)
            {
                completed = true;
            }
            else
            {
                target++;
            }
        }

        player.Score = target;
        player.Throws.Add(dartThrow);

        if (!completed)
        {
            AdvancePlayer(lobby);
            return (TurnResult.Valid, lobby);
        }

        return HandleLegWin(lobby, player);
    }

    // ==================== SHARED ====================

    private static (TurnResult result, ServerLobby lobby) HandleLegWin(
        ServerLobby lobby, ServerPlayer player)
    {
        player.Legs++;

        if (lobby.TargetLegs != 0 && lobby.TargetSets != 0
            && player.Legs >= lobby.TargetLegs)
        {
            player.Sets++;
            // Reset every player's leg counter when a new set begins
            foreach (var p in lobby.Players)
                p.Legs = 0;
        }

        bool matchWon = false;
        if (lobby.TargetSets > 0 && player.Sets >= lobby.TargetSets)
            matchWon = true;
        else if (lobby.TargetSets == 0 && lobby.TargetLegs > 0
                 && player.Legs >= lobby.TargetLegs)
            matchWon = true;

        if (matchWon)
        {
            lobby.GameStatus = GameStatus.Finished;
            lobby.WinnerUserId = player.UserId;
            AdvancePlayer(lobby);
            return (TurnResult.GameFinished, lobby);
        }

        // Leg won but match continues - reset scores for new leg
        int startingScore = GetStartingScore(lobby.GameModeKey);
        foreach (var p in lobby.Players)
            p.Score = startingScore;

        AdvancePlayer(lobby);
        return (TurnResult.LegWon, lobby);
    }

    private static void AdvancePlayer(ServerLobby lobby)
    {
        lobby.CurrentPlayerIndex =
            (lobby.CurrentPlayerIndex + 1) % lobby.Players.Count;
    }
}
