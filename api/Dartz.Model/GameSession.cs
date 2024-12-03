using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class GameSession
    {
        public int ID { get; set; }
        //public Player Winner { get; set; } //ToDo
        public int WinnerID { get; set; } //ToDo
        public virtual ICollection<Player> Players { get;  set; }
        public virtual ICollection<PlayerThrow> PlayerThrows { get; set; }

        //public GameSession()
        //{
        //    Players = new ObservableCollection<Player>();
        //    CurrentPlayerIndex = 0;
        //    IsGameActive = false;
        //}

        //public void AddPlayer(string name)
        //{
        //    if (!IsGameActive)
        //    {
        //        Players.Add(new Player(Players.Count, name));
        //    }
        //    else
        //    {
        //        throw new InvalidOperationException("Cannot add new players once the game has started.");
        //    }
        //}

        //public void StartGame()
        //{
        //    if (Players.Count < 2)
        //    {
        //        throw new InvalidOperationException("Need at least two players to start a game.");
        //    }

        //    IsGameActive = true;
        //}

        //public void NextTurn()
        //{
        //    if (!IsGameActive)
        //    {
        //        throw new InvalidOperationException("Cannot move to the next turn because the game is not active.");
        //    }

        //    CurrentPlayerIndex = (CurrentPlayerIndex + 1) % Players.Count;

        //    if (Players.All(player => player.Password <= 0))
        //    {
        //        EndGame();
        //    }
        //}

        //private void EndGame()
        //{
        //    IsGameActive = false;
        //}


        ////ToDo
        //public void PlayerThrow(Player player, int score)
        //{
        //    if (IsGameActive && Players[CurrentPlayerIndex] == player)
        //    {
        //        ScoreHandler.CalculateScore(null);

        //        NextTurn();
        //    }
        //    else
        //    {
        //        throw new InvalidOperationException("It's not the current player's turn, or the game is not active.");
        //    }
        //}
    }
}
