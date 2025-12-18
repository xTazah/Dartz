using Dartz.Model;

namespace Dartz.Service.Interfaces
{
    public interface IPlayerService
    {
        int AddPlayer(Player player, string? dartColor = null);
        Player GetPlayerByUsername(string username);
        Player GetPlayerById(int id);
        Player GetPlayerWithFriends(int id);
        IEnumerable<Player> GetAllPlayers();
        PlayerSettings GetPlayerSettings(int playerId);
        void UpdatePlayerSettings(PlayerSettings settings);
        void CreatePlayerSettings(int playerId, string? dartColor = null);
        string? GetDartColor(int playerId);
    }
}