using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class Throw
    {
        public int ID { get; set; }

        public virtual ObservableCollection<DartThrow> Throws { get; set; }

        public struct DartThrow
        {
            public int Score { get; set; }
            public E_ThrowMultiplier Multiplier { get; set; }
        }

        public enum E_ThrowMultiplier
        {
            Single = 1,
            Double = 2,
            Triple = 3
        }
    }
}
