using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dartz.Service.Interfaces;
using Dartz.Business.Interfaces;
using Dartz.Model;

namespace Dartz.Service
{
    public class GameSessionService : IGameSessionService
    {
        private readonly IGameSessionRepository _gameSessionRepository;
        public GameSessionService(IGameSessionRepository gameSessionRepository)
        {
            _gameSessionRepository = gameSessionRepository;
        }

        public void AddGameSession(GameSession gameSession)
        {
            _gameSessionRepository.AddGameSession(gameSession);
        }
    }
}
