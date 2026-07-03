namespace Dartz_API.Auth
{
    public static class AuthConstants
    {
        /// <summary>HttpOnly cookie that carries the JWT access token.</summary>
        public const string TokenCookieName = "SessionId";

        /// <summary>
        /// Header the game server uses to authenticate trusted server-to-server
        /// match submissions. The value is a shared secret (GAMESERVER_API_KEY env var).
        /// </summary>
        public const string ServiceKeyHeader = "X-Service-Key";
    }
}
