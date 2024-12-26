using Dartz.Model;
using Microsoft.EntityFrameworkCore;
using dotenv;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using dotenv.net;

namespace Dartz.Business
{
    public class DataContext : DbContext
    {
        public DbSet<GameSession> GameSessions { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<PlayerSettings> PlayerSettings { get; set; }
        public DbSet<PlayerThrow> PlayerThrows { get; set; }
        public DbSet<DBThrow> Throws { get; set; }

        public DataContext(DbContextOptions<DataContext> options) : base(options) { }
    }
}
