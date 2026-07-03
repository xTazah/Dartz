using System.Text;

namespace Dartz_API.Auth
{
    /// <summary>
    /// JWT configuration shared between the API (issuer) and the game server (validator).
    /// Values come from environment variables / configuration so the signing key is
    /// never committed to source.
    /// </summary>
    public class JwtOptions
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = "dartz-api";
        public string Audience { get; set; } = "dartz-clients";

        public static JwtOptions FromConfiguration(IConfiguration config)
        {
            var key = config["JWT_KEY"] ?? Environment.GetEnvironmentVariable("JWT_KEY");

            if (string.IsNullOrWhiteSpace(key))
            {
                // Fail fast: without a configured key the whole auth scheme is insecure.
                throw new InvalidOperationException(
                    "JWT_KEY is not configured. Set the JWT_KEY environment variable " +
                    "to a long random secret (>= 32 bytes) shared with the game server.");
            }

            if (Encoding.UTF8.GetByteCount(key) < 32)
            {
                throw new InvalidOperationException(
                    "JWT_KEY must be at least 32 bytes for HMAC-SHA256.");
            }

            return new JwtOptions
            {
                Key = key,
                Issuer = config["JWT_ISSUER"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "dartz-api",
                Audience = config["JWT_AUDIENCE"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "dartz-clients",
            };
        }
    }
}
