using Dartz.Business;
using Dartz.Model;

namespace Dartz.Business.Interfaces
{
    public interface IFriendsRepository
    {
        IEnumerable<Player> GetFriends(int playerId);
        void AddFriend(int playerId1, int playerId2);    
        void DeleteFriend(int playerId1, int playerId2);
    }
}