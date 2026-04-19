namespace Dartz.GameServer.Models;

public enum TurnResult { Valid, Bust, LegWon, GameFinished }

public static class GameModeLogic
{
    public static (TurnResult result, ServerLobby lobby) ProcessTurn501(
        ServerLobby lobby, ServerThrow dartThrow)
    {
        var player = lobby.Players[lobby.CurrentPlayerIndex];
        int newScore = player.Score - dartThrow.TotalScore;

        if (newScore == 0)
        {
            player.Score = 0;
            player.Throws.Add(dartThrow);
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
            foreach (var p in lobby.Players)
                p.Score = 501;

            AdvancePlayer(lobby);
            return (TurnResult.LegWon, lobby);
        }
        else if (newScore < 0 || newScore == 1)
        {
            player.Throws.Add(new ServerThrow());
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

    private static void AdvancePlayer(ServerLobby lobby)
    {
        lobby.CurrentPlayerIndex =
            (lobby.CurrentPlayerIndex + 1) % lobby.Players.Count;
    }
}
