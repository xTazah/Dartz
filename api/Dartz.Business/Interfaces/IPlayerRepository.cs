

using Dartz.Model;

namespace Dartz.Business.Interfaces
{
    public interface IPlayerRepository
    {
        int AddPlayer(Player player);
        Player GetPlayerByUsername(string username);
        Player GetPlayerById(int id);
        IEnumerable<Player> GetAllPlayers();
    }
}