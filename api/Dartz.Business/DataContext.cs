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

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            DotEnv.Load();

            var server = Environment.GetEnvironmentVariable("DB_SERVER");
            var port = Environment.GetEnvironmentVariable("DB_PORT");
            var database = Environment.GetEnvironmentVariable("DB_NAME");
            var user = Environment.GetEnvironmentVariable("DB_USER");
            var password = Environment.GetEnvironmentVariable("DB_PASSWORD");
            var trustCert = Environment.GetEnvironmentVariable("DB_TRUST_CERT");

            var connectionString = $"Server={server}; Port={port}; Database={database}; User Id={user}; Password={password}; Trust Server Certificate={trustCert};";

            optionsBuilder.UseNpgsql(connectionString);
        }
    }
}
