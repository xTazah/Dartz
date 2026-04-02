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

        public void UpdatePlayer(Player player)
        {
            // If password is provided (in PasswordHash field for DTO), hash it before updating
            //if (!string.IsNullOrEmpty(player.PasswordHash))
            //{
            //    player.PasswordHash = _passwordService.Hash(player.PasswordHash);
            //}
            _playerRepository.UpdatePlayer(player);
        }

        public int AddPlayer(Player player, string? dartColor = null)
        {
            player.PasswordHash = _passwordService.Hash(player.PasswordHash);

            var playerId = _playerRepository.AddPlayer(player);
            
            // Create player settings with dart color
            _playerRepository.CreatePlayerSettings(playerId, dartColor);
            
            return playerId;
        }

        public Player GetPlayerByUsername(string username)
        {
            return _playerRepository.GetPlayerByUsername(username);
        }

        public Player GetPlayerById(int id)
        {
            return _playerRepository.GetPlayerById(id);
        }

        public Player GetPlayerWithFriends(int id)
        {
            return _playerRepository.GetPlayerWithFriends(id);
        }

        public IEnumerable<Player> GetAllPlayers()
        {
            return _playerRepository.GetAllPlayers();
        }

        public PlayerSettings GetPlayerSettings(int playerId)
        {
            return _playerRepository.GetPlayerSettings(playerId);
        }

        public void UpdatePlayerSettings(PlayerSettings settings)
        {
            _playerRepository.UpdatePlayerSettings(settings);
        }

        public void CreatePlayerSettings(int playerId, string? dartColor = null)
        {
            _playerRepository.CreatePlayerSettings(playerId, dartColor);
        }

        public string? GetDartColor(int playerId)
        {
            var settings = _playerRepository.GetPlayerSettings(playerId);
            return settings?.DartColor ?? "#C0C0C0";
        }
    }
}
