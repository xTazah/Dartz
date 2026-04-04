namespace Dartz.GameServer.Models;

public class ServerPlayer
{
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Initial { get; set; } = "";
    public string? ProfilePicture { get; set; }
    public string DartColor { get; set; } = "#e42b2bff";
    public int Score { get; set; }
    public List<ServerThrow> Throws { get; set; } = new();
    public int Legs { get; set; }
    public int Sets { get; set; }
    public bool Connected { get; set; } = true;
    public string? ConnectionId { get; set; }
}

public class ConnectedSpectator
{
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Initial { get; set; } = "";
    public string? ProfilePicture { get; set; }
    public bool Connected { get; set; } = true;
    public string? ConnectionId { get; set; }
}
