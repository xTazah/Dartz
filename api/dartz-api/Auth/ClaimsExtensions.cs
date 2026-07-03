using System.Security.Claims;

namespace Dartz_API.Auth
{
    public static class ClaimsExtensions
    {
        /// <summary>
        /// Returns the authenticated player's id from the JWT, or null if there is no
        /// (valid) authenticated user. Identity always comes from the signed token,
        /// never from request bodies or route parameters.
        /// </summary>
        public static int? GetPlayerId(this ClaimsPrincipal user)
        {
            if (user?.Identity?.IsAuthenticated != true) return null;

            var raw = user.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }
    }
}
