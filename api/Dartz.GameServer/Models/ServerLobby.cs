namespace Dartz.GameServer.Models;

public enum GameStatus { Waiting = 0, Running = 1, Finished = 2 }

public class ServerLobby
{
    public string Id { get; set; } = "";
    public List<ServerPlayer> Players { get; set; } = new();
    public List<ConnectedSpectator> Spectators { get; set; } = new();
    public int OwnerUserId { get; set; }
    public string OwnerUsername { get; set; } = "";
    public GameStatus GameStatus { get; set; } = GameStatus.Waiting;
    public int CurrentPlayerIndex { get; set; }
    public string GameModeKey { get; set; } = "501";
    public int TargetLegs { get; set; }
    public int TargetSets { get; set; }
    public int? WinnerUserId { get; set; }
    public CurrentTurnDarts? CurrentTurnDarts { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CurrentTurnDarts
{
    public int PlayerId { get; set; }
    public List<DartPosition> Darts { get; set; } = new();
}

public class DartPosition
{
    public double X { get; set; }
    public double Y { get; set; }
    public double Z { get; set; }
    public int? Score { get; set; }
    public int? Multiplier { get; set; }
}
