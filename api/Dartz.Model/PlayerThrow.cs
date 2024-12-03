using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class PlayerThrow
    {
        public int ID { get; set; }
        public int PlayerID { get; set; }
        public Player Player { get; set; }
        public GameSession Session { get; set; }
        public DBThrow Throw { get; set; }
    }
}
