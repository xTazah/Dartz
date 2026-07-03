using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Dartz_API.Auth
{
    /// <summary>
    /// Issues signed JWT access tokens for authenticated players.
    /// The signing key, issuer and audience are shared with the game server
    /// (via JWT_* environment variables) so the same token validates on both.
    /// </summary>
    public class JwtTokenService
    {
        private readonly JwtOptions _options;

        public JwtTokenService(JwtOptions options)
        {
            _options = options;
        }

        public string CreateToken(int playerId, string username)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                // ClaimTypes.NameIdentifier maps to "nameid"; we read it back as the player id.
                new Claim(ClaimTypes.NameIdentifier, playerId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(JwtRegisteredClaimNames.Sub, playerId.ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                // Long-lived to match the previous "session that never expires" behaviour,
                // but bounded so a leaked token does not live forever.
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
