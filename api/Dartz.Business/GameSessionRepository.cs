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
    public class GameSessionRepository : IGameSessionRepository
    {
        DataContext dataContext { get; set; }

        public GameSessionRepository(DataContext context)
        {
            dataContext = context;
        }

        public void AddGameSession(GameSession gameSession)
        {
            var players = gameSession.Players.ToList();

            gameSession.Players = null;
            dataContext.GameSessions.Add(gameSession);

            dataContext.SaveChanges();

            gameSession.Players = players;

            dataContext.SaveChanges();
        }
    }
}
