using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class PlayerSettings
    {
        public int ID { get; set; }
        public int PlayerID { get; set; }
        public bool AllowNoAuth {  get; set; }
    }
}
