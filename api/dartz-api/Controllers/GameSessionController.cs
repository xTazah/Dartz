using Dartz.Service.Interfaces;
using Dartz.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dartz_API.Controllers
{
    [ApiController]
    [Route("gameSession")]
    [Authorize]
    public class GameSessionController : ControllerBase
    {

        private readonly ILogger<GameSessionController> _logger;
        private readonly IGameSessionService _gameSessionService;

        public GameSessionController(ILogger<GameSessionController> logger, IGameSessionService gameSessionService)
        {
            _logger = logger;
            _gameSessionService = gameSessionService;
        }

        [HttpPost("")]
        public ActionResult AddGameSession([FromForm] GameSession gs)
        {
            _gameSessionService.AddGameSession(gs);
            return Ok();
        }
    }
}
