using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class Player
    {
        public int ID { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public virtual ICollection<GameSession> GameSessions { get; set; }
        public virtual ICollection<Player> Friends {get; set;}

        [NotMapped]
        public string Initial { get =>
             Username.Substring(0, 1).ToUpper();
             }
    }
}
