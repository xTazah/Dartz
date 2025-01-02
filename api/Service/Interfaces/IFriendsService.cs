using Dartz.Model;

namespace Dartz.Service.Interfaces
{
    public interface IFriendsService
    {
        IEnumerable<FrontendUser> GetFriends(int playerId);
        void AddFriend(int playerId1, int playerId2);
        void DeleteFriend(int playerId1, int playerId2);
        bool CheckFriendship(int playerId1, int playerId2);
    }
}