

using Dartz.Model;

namespace Dartz.Business.Interfaces
{
    public interface IPlayerRepository
    {
        int AddPlayer(Player player);
        void UpdatePlayer(Player player);
        Player GetPlayerByUsername(string username);
        Player GetPlayerById(int id);
        Player GetPlayerWithFriends(int id);
        IEnumerable<Player> GetAllPlayers();
        PlayerSettings GetPlayerSettings(int playerId);
        void UpdatePlayerSettings(PlayerSettings settings);
        void CreatePlayerSettings(int playerId, string? dartColor = null);
    }
}