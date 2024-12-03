using System.Security.Cryptography;

namespace Dartz.Service.Interfaces
{
    public interface IPasswordService
    {
        public string Hash(string password);
        public bool Verify(string password, string passwordHash);

    }
}