using Dartz.Model;

namespace Dartz.Service.Interfaces
{
    public interface IPlayerService
    {
        int AddPlayer(Player player);
        Player GetPlayerByUsername(string username);
        Player GetPlayerById(int id);
        Player GetPlayerWithFriends(int id);

        IEnumerable<Player> GetAllPlayers();
    }
}