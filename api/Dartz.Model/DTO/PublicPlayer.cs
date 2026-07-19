namespace Dartz.Model
{
    /// <summary>
    /// Public-facing projection of <see cref="Player"/>. Returned by all player
    /// lookup endpoints so sensitive fields (PasswordHash) and EF navigation
    /// properties are never serialized to clients.
    /// </summary>
    public class PublicPlayer
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Initial { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public string? Bio { get; set; }
        public DateOnly? MemberSince { get; set; }

        public static PublicPlayer FromPlayer(Player p) => new()
        {
            Id = p.ID,
            Username = p.Username,
            Initial = p.Initial,
            ProfilePicture = p.ProfilePicture,
            Bio = p.Bio,
            MemberSince = p.MemberSince,
        };
    }
}
