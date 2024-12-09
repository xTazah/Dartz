using Dartz.Service.Interfaces;
using Dartz.Model;
using Microsoft.AspNetCore.Mvc;

namespace Dartz_API.Controllers
{
    [ApiController]
    [Route("player")]
    public class PlayerController : ControllerBase
    {

        private readonly ILogger<PlayerController> _logger;
        private readonly IPlayerService _playerService;
        private readonly IPasswordService _passwordService;

        public PlayerController(ILogger<PlayerController> logger, IPlayerService playerService, IPasswordService passwordService)
        {
            _logger = logger;
            _playerService = playerService;
            _passwordService = passwordService;
        }

        [HttpGet("")]
        public ActionResult<IEnumerable<Player>> GetAll()
        {
            return Ok(_playerService.GetAllPlayers());
        }

        [HttpGet("username/{username}")]
        public ActionResult<Player> GetByUsername(string username)
        {
            return Ok(_playerService.GetPlayerByUsername(username));
        }

        [HttpGet("{id}")]
        public ActionResult<Player> GetById(int id)
        {
            return Ok(_playerService.GetPlayerById(id));
        }

        [HttpPost("signup")]
        public ActionResult<int> AddPlayer([FromForm] PlayerDTO p)
        {
            var tmp = _playerService.GetPlayerByUsername(p.Username);
            if (tmp != null)
            {
                return BadRequest("Username already exists");
            }
            var player = new Player()
            {
                Username=p.Username,
                PasswordHash= p.Password
            };
            return Ok(_playerService.AddPlayer(player));
        }

        [HttpPost("login")]
        public ActionResult<Player> LoginPlayer([FromForm] PlayerDTO p)
        {
            var user = _playerService.GetPlayerByUsername(p.Username);
            if (user == null)
            {
                return BadRequest("User does not exist");
            }
            var success = _passwordService.Verify(p.Password, user.PasswordHash);
            if (!success)
            {
                return Unauthorized("Wrong password");
            }

            return Ok(new FrontendUser { Id = user.ID, Initial = user.Initial, Username = user.Username});
        }
    }
}
