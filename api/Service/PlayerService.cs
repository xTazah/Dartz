using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dartz.Business.Interfaces;
using Dartz.Model;
using Dartz.Service.Interfaces;

namespace Dartz.Service
{
    public class PlayerService : IPlayerService
    {
        private readonly IPlayerRepository _playerRepository;
        private readonly IPasswordService _passwordService;
        public PlayerService(IPlayerRepository playerRepository, IPasswordService passwordService)
        {
            _playerRepository = playerRepository;
            _passwordService = passwordService;
        }

        public int AddPlayer(Player player)
        {
            player.PasswordHash = _passwordService.Hash(player.PasswordHash);

            return _playerRepository.AddPlayer(player);
        }

        public Player GetPlayerByUsername(string username)
        {
            return _playerRepository.GetPlayerByUsername(username);
        }

        public Player GetPlayerById(int id)
        {
            return _playerRepository.GetPlayerById(id);
        }

        public IEnumerable<Player> GetAllPlayers()
        {
            return _playerRepository.GetAllPlayers();
        }

    }
}
