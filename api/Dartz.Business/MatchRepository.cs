using Microsoft.EntityFrameworkCore;
using Dartz.Business.Interfaces;
using Dartz.Model;

namespace Dartz.Business
{
    public class MatchRepository : IMatchRepository
    {
        private readonly DataContext _dataContext;

        public MatchRepository(DataContext context)
        {
            _dataContext = context;
        }

        public async Task<Match> AddMatch(Match match)
        {
            _dataContext.Matches.Add(match);
            await _dataContext.SaveChangesAsync();
            return match;
        }

        public async Task<List<Match>> GetMatchesByPlayer(int playerId, int page, int pageSize)
        {
            return await _dataContext.Matches
                .Include(m => m.WinnerPlayer)
                .Include(m => m.MatchPlayers)
                    .ThenInclude(mp => mp.Player)
                .Include(m => m.MatchPlayers)
                    .ThenInclude(mp => mp.Turns)
                .Where(m => m.MatchPlayers.Any(mp => mp.PlayerID == playerId))
                .OrderByDescending(m => m.FinishedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetMatchCountByPlayer(int playerId)
        {
            return await _dataContext.Matches
                .Where(m => m.MatchPlayers.Any(mp => mp.PlayerID == playerId))
                .CountAsync();
        }

        public async Task<Match?> GetMatchDetail(int matchId)
        {
            return await _dataContext.Matches
                .Include(m => m.WinnerPlayer)
                .Include(m => m.MatchPlayers)
                    .ThenInclude(mp => mp.Player)
                .Include(m => m.MatchLegs)
                    .ThenInclude(l => l.WinnerPlayer)
                .Include(m => m.MatchLegs)
                    .ThenInclude(l => l.Turns)
                        .ThenInclude(t => t.MatchPlayer)
                            .ThenInclude(mp => mp.Player)
                .Include(m => m.MatchLegs)
                    .ThenInclude(l => l.Turns)
                        .ThenInclude(t => t.Darts)
                .FirstOrDefaultAsync(m => m.ID == matchId);
        }

        public async Task<PlayerStats?> GetPlayerStats(int playerId)
        {
            return await _dataContext.PlayerStatsSet
                .Include(ps => ps.Player)
                .FirstOrDefaultAsync(ps => ps.PlayerID == playerId);
        }

        public async Task<PlayerStats> UpsertPlayerStats(PlayerStats stats)
        {
            var existing = await _dataContext.PlayerStatsSet
                .FirstOrDefaultAsync(ps => ps.PlayerID == stats.PlayerID);

            if (existing == null)
            {
                _dataContext.PlayerStatsSet.Add(stats);
            }
            else
            {
                existing.TotalMatches = stats.TotalMatches;
                existing.TotalWins = stats.TotalWins;
                existing.TotalLegs = stats.TotalLegs;
                existing.TotalLegsWon = stats.TotalLegsWon;
                existing.TotalTurns = stats.TotalTurns;
                existing.TotalPoints = stats.TotalPoints;
                existing.TotalDarts = stats.TotalDarts;
                existing.OverallAverage = stats.OverallAverage;
                existing.HighestTurnScore = stats.HighestTurnScore;
                existing.Count100Plus = stats.Count100Plus;
                existing.Count140Plus = stats.Count140Plus;
                existing.Count180s = stats.Count180s;
                existing.TotalBusts = stats.TotalBusts;
                existing.TotalCheckoutAttempts = stats.TotalCheckoutAttempts;
                existing.TotalCheckouts = stats.TotalCheckouts;
                existing.HighestCheckout = stats.HighestCheckout;
                existing.BestLegDarts = stats.BestLegDarts;
                existing.BestMatchAverage = stats.BestMatchAverage;
                existing.WorstMatchAverage = stats.WorstMatchAverage;
                existing.CurrentWinStreak = stats.CurrentWinStreak;
                existing.LongestWinStreak = stats.LongestWinStreak;
                existing.TotalFirst9Turns = stats.TotalFirst9Turns;
                existing.TotalFirst9Points = stats.TotalFirst9Points;
                existing.First9Average = stats.First9Average;
                existing.LastPlayedAt = stats.LastPlayedAt;
            }

            await _dataContext.SaveChangesAsync();
            return existing ?? stats;
        }

        public async Task<List<Match>> GetMatchesWithOpponents(int playerId)
        {
            return await _dataContext.Matches
                .Include(m => m.WinnerPlayer)
                .Include(m => m.MatchPlayers)
                    .ThenInclude(mp => mp.Player)
                .Where(m => m.MatchPlayers.Any(mp => mp.PlayerID == playerId))
                .OrderByDescending(m => m.FinishedAt)
                .ToListAsync();
        }
    }
}
