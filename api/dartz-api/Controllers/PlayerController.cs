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
            var result = _playerService.GetPlayerByUsername(username);
            if(result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpGet("{id}")]
        public ActionResult<Player> GetById(int id)
        {
            var result = _playerService.GetPlayerById(id);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost("signup")]
        public ActionResult<int> AddPlayer([FromBody] PlayerDTO p)
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

            _playerService.AddPlayer(player, p.DartColor);

            //"auto" login the user by creating a session and appending a cookie to the response
            var sessionId = SessionMiddleware.CreateSession(player.Username);
            Response.Cookies.Append("SessionId", sessionId, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.MaxValue
            });

            var dartColor = _playerService.GetDartColor(player.ID);
            var settings = _playerService.GetPlayerSettings(player.ID);
            return Ok(new FrontendUser { Id = player.ID, Initial = player.Initial, Username = player.Username, DartColor = dartColor, AllowNoAuth = settings?.AllowNoAuth ?? false });
        }

        [HttpPost("login")]
        public ActionResult<FrontendUser> LoginPlayer([FromBody] PlayerDTO p)
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

            var sessionId = SessionMiddleware.CreateSession(user.Username);
            Response.Cookies.Append("SessionId", sessionId, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.MaxValue,
                Path = "/"
            });

            var dartColor = _playerService.GetDartColor(user.ID);
            var settings = _playerService.GetPlayerSettings(user.ID);
            return Ok(new FrontendUser { Id = user.ID, Initial = user.Initial, Username = user.Username, DartColor = dartColor, AllowNoAuth = settings?.AllowNoAuth ?? false });
        }

        [HttpPost("login/sessionId")]
        public ActionResult<FrontendUser> LoginPlayerBySessionID()
        {
            var sessionId = Request.Cookies["SessionId"];
            if (string.IsNullOrEmpty(sessionId))
            {
                return Unauthorized("No SessionID found in cookies. Please login manually");

            }
            var username = SessionMiddleware.GetUsernameFromSession(sessionId);

            if (username == null)
            {
                return BadRequest("Session for this user does not exist");
            }

            var user = _playerService.GetPlayerByUsername(username);

            if (user == null)
            {
                return BadRequest("User does not exist");
            }

            var dartColor = _playerService.GetDartColor(user.ID);
            var settings = _playerService.GetPlayerSettings(user.ID);
            return Ok(new FrontendUser { Id = user.ID, Initial = user.Initial, Username = user.Username, DartColor = dartColor, AllowNoAuth = settings?.AllowNoAuth ?? false });
        }

        [HttpPost("logout")]
        public ActionResult LogoutPlayer()
        {
            var sessionId = Request.Cookies["SessionId"];
            if (!string.IsNullOrEmpty(sessionId))
            {
                SessionMiddleware.RemoveSession(sessionId); 
                Response.Cookies.Delete("SessionId", new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/",
                });
            }
            return Ok();
        }

        [HttpGet("settings/{playerId}")]
        public ActionResult<PlayerSettings> GetSettings(int playerId)
        {
            var settings = _playerService.GetPlayerSettings(playerId);
            if (settings == null)
            {
                return NotFound("Settings not found for this player");
            }
            return Ok(settings);
        }

        [HttpGet("settings/allowNoAuth/{playerId}")]
        public ActionResult<bool> CheckAllowNoAuth(int playerId)
        {
            var settings = _playerService.GetPlayerSettings(playerId);
            return Ok(settings?.AllowNoAuth ?? false);
        }

        [HttpPut("settings")]
        public ActionResult UpdateSettings([FromBody] PlayerSettings settings)
        {
            _playerService.UpdatePlayerSettings(settings);
            return Ok();
        }

        [HttpPut("settings/dartColor")]
        public ActionResult UpdateDartColor([FromBody] DartColorDTO dto)
        {
            var settings = _playerService.GetPlayerSettings(dto.PlayerId);
            if (settings == null)
            {
                // Create settings for existing users who don't have them
                _playerService.CreatePlayerSettings(dto.PlayerId, dto.DartColor);
                return Ok();
            }
            settings.DartColor = dto.DartColor;
            _playerService.UpdatePlayerSettings(settings);
            return Ok();
        }

        [HttpPut("settings/all")]
        public ActionResult UpdateAllSettings([FromBody] UserSettingsDTO dto)
        {
            var settings = _playerService.GetPlayerSettings(dto.PlayerId);
            if (settings == null)
            {
                // Create settings for existing users who don't have them
                _playerService.CreatePlayerSettings(dto.PlayerId, dto.DartColor);
                settings = _playerService.GetPlayerSettings(dto.PlayerId);
            }
            if (settings != null)
            {
                settings.DartColor = dto.DartColor;
                settings.AllowNoAuth = dto.AllowNoAuth;
                _playerService.UpdatePlayerSettings(settings);
            }
            return Ok();
        }
    }

    public class DartColorDTO
    {
        public int PlayerId { get; set; }
        public string DartColor { get; set; }
    }

    public class UserSettingsDTO
    {
        public int PlayerId { get; set; }
        public string? DartColor { get; set; }
        public bool AllowNoAuth { get; set; }
    }
}
