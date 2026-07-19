using Dartz.Service.Interfaces;
using Dartz.Model;
using Dartz_API.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dartz_API.Controllers
{
    [ApiController]
    [Route("player")]
    [Authorize]
    public class PlayerController : ControllerBase
    {

        private readonly ILogger<PlayerController> _logger;
        private readonly IPlayerService _playerService;
        private readonly IPasswordService _passwordService;
        private readonly JwtTokenService _tokenService;

        public PlayerController(ILogger<PlayerController> logger, IPlayerService playerService, IPasswordService passwordService, JwtTokenService tokenService)
        {
            _logger = logger;
            _playerService = playerService;
            _passwordService = passwordService;
            _tokenService = tokenService;
        }

        // Issues the JWT into the HttpOnly cookie used for subsequent REST requests and
        // returns it so it can also be handed to the SignalR client.
        private string IssueAuthCookie(int playerId, string username)
        {
            var token = _tokenService.CreateToken(playerId, username);
            Response.Cookies.Append(AuthConstants.TokenCookieName, token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(30),
                Path = "/"
            });
            return token;
        }

        // Player lookups return PublicPlayer, never the raw entity, so PasswordHash
        // and navigation properties are never serialized to clients.
        [HttpGet("")]
        public ActionResult<IEnumerable<PublicPlayer>> GetAll()
        {
            return Ok(_playerService.GetAllPlayers().Select(PublicPlayer.FromPlayer));
        }

        [HttpGet("username/{username}")]
        public ActionResult<PublicPlayer> GetByUsername(string username)
        {
            var result = _playerService.GetPlayerByUsername(username);
            if(result == null)
            {
                return NotFound();
            }
            return Ok(PublicPlayer.FromPlayer(result));
        }

        [HttpGet("{id}")]
        public ActionResult<PublicPlayer> GetById(int id)
        {
            var result = _playerService.GetPlayerById(id);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(PublicPlayer.FromPlayer(result));
        }

        [HttpPost("signup")]
        [AllowAnonymous]
        public ActionResult<int> AddPlayer([FromBody] PlayerDTO p)
        {
            if (string.IsNullOrWhiteSpace(p.Username) || p.Username.Length > 32)
            {
                return BadRequest("Username must be between 1 and 32 characters");
            }
            if (string.IsNullOrEmpty(p.Password) || p.Password.Length > 128)
            {
                return BadRequest("Password must be between 1 and 128 characters");
            }

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

            // "auto" login the user by issuing a JWT in the HttpOnly cookie
            var token = IssueAuthCookie(player.ID, player.Username);

            var dartColor = _playerService.GetDartColor(player.ID);
            var settings = _playerService.GetPlayerSettings(player.ID);
            return Ok(new FrontendUser { Id = player.ID, Initial = player.Initial, Username = player.Username, DartColor = dartColor, AllowNoAuth = settings?.AllowNoAuth ?? false, Token = token });
        }

        [HttpPost("login")]
        [AllowAnonymous]
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

            var token = IssueAuthCookie(user.ID, user.Username);

            var dartColor = _playerService.GetDartColor(user.ID);
            var settings = _playerService.GetPlayerSettings(user.ID);
            return Ok(new FrontendUser { Id = user.ID, Initial = user.Initial, Username = user.Username, DartColor = dartColor, AllowNoAuth = settings?.AllowNoAuth ?? false, ProfilePicture=user.ProfilePicture, Bio=user.Bio, MemberSince=user.MemberSince, Token = token });
        }

        [HttpPost("editProfile")]
        public ActionResult<int> EditProfile([FromBody] PlayerDTO p)
        {
            // Identity comes from the authenticated token, never from the request body.
            var callerId = User.GetPlayerId();
            if (callerId == null)
                return Unauthorized();

            var tmp = _playerService.GetPlayerById(callerId.Value);
            if (tmp == null)
            {
                return BadRequest("User does not exist");
            }

            if (!ProfileInputValidator.IsAllowedProfilePicture(p.ProfilePicture))
            {
                return BadRequest("Invalid profile picture URL");
            }

            if (p.Bio != null && p.Bio.Length > 1000)
            {
                return BadRequest("Bio must be at most 1000 characters");
            }

            var player = new Player()
            {
                ID = tmp.ID,
                Username = p.Username,
                //PasswordHash = string.IsNullOrEmpty(p.Password) ? null : p.Password,
                ProfilePicture = p.ProfilePicture,
                Bio = p.Bio
            };

            _playerService.UpdatePlayer(player);

            return Ok();
        }

        // Returns the current user based on the JWT in the cookie. Replaces the old
        // server-side session lookup.
        [HttpPost("login/sessionId")]
        public ActionResult<FrontendUser> LoginPlayerBySessionID()
        {
            var callerId = User.GetPlayerId();
            if (callerId == null)
            {
                return Unauthorized("Not authenticated. Please login manually");
            }

            var user = _playerService.GetPlayerById(callerId.Value);

            if (user == null)
            {
                return BadRequest("User does not exist");
            }

            // Re-issue a fresh token so the SignalR client (which can't read the
            // HttpOnly cookie) has one in memory after a page reload.
            var token = IssueAuthCookie(user.ID, user.Username);

            var dartColor = _playerService.GetDartColor(user.ID);
            var settings = _playerService.GetPlayerSettings(user.ID);
            return Ok(new FrontendUser { Id = user.ID, Initial = user.Initial, Username = user.Username, ProfilePicture=user.ProfilePicture, Bio=user.Bio, MemberSince=user.MemberSince, DartColor = dartColor, AllowNoAuth = settings?.AllowNoAuth ?? false, Token = token });
        }

        [HttpPost("logout")]
        public ActionResult LogoutPlayer()
        {
            Response.Cookies.Delete(AuthConstants.TokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
            });
            return Ok();
        }

        [HttpGet("settings/{playerId}")]
        public ActionResult<PlayerSettings> GetSettings(int playerId)
        {
            // Settings are private to their owner.
            var callerId = User.GetPlayerId();
            if (callerId == null) return Unauthorized();
            if (playerId != callerId.Value) return Forbid();

            var settings = _playerService.GetPlayerSettings(playerId);
            if (settings == null)
            {
                return NotFound("Settings not found for this player");
            }
            return Ok(settings);
        }

        [HttpGet("settings/allowNoAuth/{playerId}")]
        [AllowAnonymous]
        public ActionResult<bool> CheckAllowNoAuth(int playerId)
        {
            var settings = _playerService.GetPlayerSettings(playerId);
            return Ok(settings?.AllowNoAuth ?? false);
        }

        [HttpPut("settings")]
        public ActionResult UpdateSettings([FromBody] PlayerSettings settings)
        {
            var callerId = User.GetPlayerId();
            if (callerId == null) return Unauthorized();

            // Only allow editing your own settings.
            var existing = _playerService.GetPlayerSettings(callerId.Value);
            if (existing == null || existing.ID != settings.ID || existing.PlayerID != callerId.Value)
            {
                return Forbid();
            }

            _playerService.UpdatePlayerSettings(settings);
            return Ok();
        }

        [HttpPut("settings/dartColor")]
        public ActionResult UpdateDartColor([FromBody] DartColorDTO dto)
        {
            var callerId = User.GetPlayerId();
            if (callerId == null) return Unauthorized();
            if (dto.PlayerId != callerId.Value) return Forbid();

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
            var callerId = User.GetPlayerId();
            if (callerId == null) return Unauthorized();
            if (dto.PlayerId != callerId.Value) return Forbid();

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
