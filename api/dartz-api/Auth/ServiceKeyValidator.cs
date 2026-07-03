using System.Security.Cryptography;
using System.Text;

namespace Dartz_API.Auth
{
    /// <summary>
    /// Validates the shared secret the game server presents for trusted
    /// server-to-server calls (e.g. submitting completed matches).
    /// </summary>
    public class ServiceKeyValidator
    {
        private readonly byte[]? _expected;

        public ServiceKeyValidator(IConfiguration config)
        {
            var key = config["GAMESERVER_API_KEY"]
                ?? Environment.GetEnvironmentVariable("GAMESERVER_API_KEY");
            _expected = string.IsNullOrEmpty(key) ? null : Encoding.UTF8.GetBytes(key);
        }

        public bool IsConfigured => _expected != null;

        public bool IsValid(string? presented)
        {
            if (_expected == null || string.IsNullOrEmpty(presented)) return false;
            var presentedBytes = Encoding.UTF8.GetBytes(presented);
            return CryptographicOperations.FixedTimeEquals(presentedBytes, _expected);
        }
    }
}
