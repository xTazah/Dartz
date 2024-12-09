using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class FrontendUser
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Initial { get; set; }
    }
}
