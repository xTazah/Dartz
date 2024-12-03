using Dartz.Business;
using Dartz.Model;

namespace Dartz.Business.Interfaces
{
    public interface IGameSessionRepository
    {
        void AddGameSession(GameSession gameSession);
    }
}