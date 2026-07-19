namespace Dartz_API.Auth
{
    public static class ProfileInputValidator
    {
        /// <summary>
        /// Validates a user-supplied profile picture reference before it is stored and
        /// later rendered into other users' &lt;img src&gt;. Only absolute https URLs and
        /// data:image/* URIs are permitted; this blocks javascript:, data:text/html,
        /// and other unexpected schemes. Empty/null is allowed (no picture).
        /// </summary>
        public static bool IsAllowedProfilePicture(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return true;

            value = value.Trim();

            if (value.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            {
                // Cap inline images (~1.5 MB decoded) to prevent DB bloat / oversized payloads.
                return value.Length <= 2_000_000;
            }

            if (value.Length <= 2048 && Uri.TryCreate(value, UriKind.Absolute, out var uri))
            {
                return uri.Scheme == Uri.UriSchemeHttps;
            }

            return false;
        }
    }
}
