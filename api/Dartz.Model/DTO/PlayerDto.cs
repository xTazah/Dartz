using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class PlayerDTO
    {
        public int? ID { get; set; }
        public string Username { get; set; }
        public string? Password { get; set; }
        public string? DartColor { get; set; }
        public string? ProfilePicture { get; set; }
        public string? Bio { get; set; }

    }
}
