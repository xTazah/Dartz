using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dartz.Service.Interfaces;
using Dartz.Business.Interfaces;
using Dartz.Model;
using System.Numerics;

namespace Dartz.Service
{
    public class FriendsService : IFriendsService
    {
        private readonly IFriendsRepository _friendsRepository;
        private readonly IPlayerService _playerService;
        public FriendsService(IFriendsRepository friendsRepository,IPlayerService playerService)
        {
            _friendsRepository = friendsRepository;
            _playerService = playerService;
        }

        public IEnumerable<FrontendUser> GetFriends(int playerId)
        {
            List<FrontendUser> frontendFriends = new List<FrontendUser>();
            var friends = _friendsRepository.GetFriends(playerId);
            foreach (var friend in friends)
            {
                frontendFriends.Add(new FrontendUser { Id = friend.ID, Initial = friend.Initial, Username = friend.Username });
            }
            return frontendFriends;
        }
        public void AddFriend(int playerId1, int playerId2)
        {
            _friendsRepository.AddFriend(playerId1, playerId2);
        }

        public void DeleteFriend(int playerId1, int playerId2)
        {
            _friendsRepository.DeleteFriend(playerId1, playerId2);
        }

        public bool CheckFriendship(int playerId1, int playerId2)
        {
            var player = _playerService.GetPlayerWithFriends(playerId1);

            if (player == null)
                return true;
            
            if (player.Friends.Any(x => x.ID == playerId2))
                return true;
            return false;
        }
    }
}
