namespace Dartz.GameServer.Models;

public class ServerThrow
{
    public int Score1 { get; set; }
    public int Multiplier1 { get; set; }
    public int Score2 { get; set; }
    public int Multiplier2 { get; set; }
    public int Score3 { get; set; }
    public int Multiplier3 { get; set; }

    public int TotalScore =>
        Score1 * Multiplier1 + Score2 * Multiplier2 + Score3 * Multiplier3;

    public bool IsValid()
    {
        return IsValidDart(Score1, Multiplier1)
            && IsValidDart(Score2, Multiplier2)
            && IsValidDart(Score3, Multiplier3);
    }

    private static bool IsValidDart(int score, int multiplier)
    {
        if (multiplier < 1 || multiplier > 3) return false;
        if (score < 0 || score > 25) return false;
        if (score == 25 && multiplier == 3) return false;
        if (score > 20 && score != 25) return false;
        return true;
    }
}
