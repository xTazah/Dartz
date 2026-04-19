using Dartz.GameServer.Models;
using FluentAssertions;

namespace Dartz.GameServer.Tests;

public class ServerThrowTests
{
    private static ServerThrow T(int s1, int m1, int s2 = 0, int m2 = 1, int s3 = 0, int m3 = 1)
        => new() { Score1 = s1, Multiplier1 = m1, Score2 = s2, Multiplier2 = m2, Score3 = s3, Multiplier3 = m3 };

    [Fact]
    public void TotalScore_sums_all_three_darts()
    {
        T(20, 3, 19, 3, 18, 3).TotalScore.Should().Be(60 + 57 + 54);
    }

    [Theory]
    [InlineData(0, 1)]   // miss
    [InlineData(20, 3)]  // treble 20
    [InlineData(25, 2)]  // bullseye
    [InlineData(25, 1)]  // outer bull
    public void IsValid_accepts_legal_darts(int score, int multiplier)
    {
        T(score, multiplier).IsValid().Should().BeTrue();
    }

    [Theory]
    [InlineData(25, 3, "triple bull does not exist")]
    [InlineData(21, 1, "scores above 20 are not valid (except the bull at 25)")]
    [InlineData(-1, 1, "negative scores are invalid")]
    [InlineData(20, 0, "multiplier 0 is invalid")]
    [InlineData(20, 4, "multiplier above 3 is invalid")]
    public void IsValid_rejects_illegal_darts(int score, int multiplier, string because)
    {
        T(score, multiplier).IsValid().Should().BeFalse(because);
    }

    [Fact]
    public void IsValid_requires_every_dart_to_be_legal()
    {
        T(20, 3, 20, 3, 25, 3).IsValid().Should().BeFalse(
            "the third dart is a triple bull which doesn't exist");
    }
}
