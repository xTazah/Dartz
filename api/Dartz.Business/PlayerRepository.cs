using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dartz.Model;
using Dartz.Business.Interfaces;

namespace Dartz.Business
{
    public class PlayerRepository : IPlayerRepository
    {
        DataContext dataContext { get; set; }

        public PlayerRepository(DataContext context)
        {
            dataContext = context;
        }

        public int AddPlayer(Player player)
        {
            try
            {
                dataContext.Players.Add(player);

                dataContext.SaveChanges();

                return player.ID;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public Player GetPlayerByUsername(string username)
        {
            return dataContext.Players.FirstOrDefault(x => x.Username.Equals(username));
        }

        public Player GetPlayerById(int id)
        {
            return dataContext.Players.FirstOrDefault(x => x.ID == id);
        }

        public IEnumerable<Player> GetAllPlayers()
        {
            return dataContext.Players.ToList();
        }
    }
}
