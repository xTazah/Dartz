using Dartz.Model;
using Dartz.Model.DTO;

namespace Dartz.Service.Interfaces
{
    public interface IMatchService
    {
        Task<Match> SubmitMatch(MatchSubmissionDto submission);
        Task<List<MatchHistoryDto>> GetMatchHistory(int playerId, int page, int pageSize);
        Task<MatchDetailDto?> GetMatchDetail(int matchId);
        Task<PlayerStatsDto?> GetPlayerStats(int playerId);
        Task<List<OpponentStatsDto>> GetOpponentStats(int playerId);
        Task<List<ActivityDayDto>> GetActivityData(int playerId);
        Task<List<MatchTrendPointDto>> GetMatchTrends(int playerId);
    }
}
