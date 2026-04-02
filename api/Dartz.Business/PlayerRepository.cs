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

        public Player GetPlayerWithFriends(int id)
        {
            return dataContext.Players.Include(x=>x.Friends).FirstOrDefault(x => x.ID == id);
        }

        public IEnumerable<Player> GetAllPlayers()
        {
            return dataContext.Players.ToList();
        }

        public PlayerSettings GetPlayerSettings(int playerId)
        {
            return dataContext.PlayerSettings.FirstOrDefault(x => x.PlayerID == playerId);
        }

        public void UpdatePlayerSettings(PlayerSettings settings)
        {
            var existing = dataContext.PlayerSettings.FirstOrDefault(x => x.ID == settings.ID);
            if (existing != null)
            {
                existing.DartColor = settings.DartColor;
                existing.AllowNoAuth = settings.AllowNoAuth;
                dataContext.SaveChanges();
            }
        }

        public void UpdatePlayer(Player player)
        {
            var existing = dataContext.Players.FirstOrDefault(x => x.ID == player.ID || x.Username == player.Username);
            if (existing == null) return;

            // Only update values that are provided (not null)
            //if (!string.IsNullOrEmpty(player.Username) && player.Username != existing.Username)
            //{
            //    existing.Username = player.Username;
            //}

            //if (!string.IsNullOrEmpty(player.PasswordHash))
            //{
            //    // PasswordHash is expected to contain the hashed password already when passed in
            //    existing.PasswordHash = player.PasswordHash;
            //}

            if (player.ProfilePicture != null)
            {
                existing.ProfilePicture = player.ProfilePicture;
            }

            if (player.Bio != null)
            {
                existing.Bio = player.Bio;
            }

            dataContext.SaveChanges();
        }

        public void CreatePlayerSettings(int playerId, string? dartColor = null)
        {
            var settings = new PlayerSettings
            {
                PlayerID = playerId,
                DartColor = dartColor ?? "#C0C0C0",
                AllowNoAuth = false
            };
            dataContext.PlayerSettings.Add(settings);
            dataContext.SaveChanges();
        }
    }
}
