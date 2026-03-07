using Dartz.Model;

namespace Dartz.Business.Interfaces
{
    public interface IMatchRepository
    {
        Task<Match> AddMatch(Match match);
        Task<List<Match>> GetMatchesByPlayer(int playerId, int page, int pageSize);
        Task<int> GetMatchCountByPlayer(int playerId);
        Task<Match?> GetMatchDetail(int matchId);
        Task<PlayerStats?> GetPlayerStats(int playerId);
        Task<PlayerStats> UpsertPlayerStats(PlayerStats stats);
        Task<List<Match>> GetMatchesWithOpponents(int playerId);
    }
}
