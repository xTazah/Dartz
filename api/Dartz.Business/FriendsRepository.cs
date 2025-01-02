using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dartz.Business.Interfaces;
using Dartz.Model;

namespace Dartz.Business
{
    public class FriendsRepository : IFriendsRepository
    {
        DataContext dataContext { get; set; }

        public FriendsRepository(DataContext context)
        {
            dataContext = context;
        }

        public IEnumerable<Player> GetFriends(int playerId)
        {
            var player = dataContext.Players.Include(x=>x.Friends).FirstOrDefault(x => x.ID== playerId);
            if(player!= null && player.Friends != null && player.Friends.Count!=0)
                return player.Friends;

            return [];
        }

        public void AddFriend(int playerId1, int playerId2)
        {
            
            var player1 = dataContext.Players.FirstOrDefault(x => x.ID== playerId1);
            var player2 = dataContext.Players.FirstOrDefault(x => x.ID== playerId2);      

            if (player1 != null && player2 != null)
            {
                if (player1.Friends == null)
                    player1.Friends = new List<Player>();
                player1.Friends.Add(player2);

                if (player2.Friends == null)
                    player2.Friends = new List<Player>();
                player2.Friends.Add(player1);

                dataContext.SaveChanges();
            }

        }

        public void DeleteFriend(int playerId1, int playerId2)
        {
            var player1 = dataContext.Players.Include(x=>x.Friends).FirstOrDefault(x => x.ID== playerId1);
            var player2 = dataContext.Players.Include(x => x.Friends).FirstOrDefault(x => x.ID== playerId2);
            if (player1 != null && player2 != null && player1.Friends != null && player2.Friends != null)
            {
                player1.Friends.Remove(player2);
                player2.Friends.Remove(player1);
            }
            dataContext.SaveChanges();
        }
    }
}
