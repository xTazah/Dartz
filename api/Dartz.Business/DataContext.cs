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

        // Match history entities
        public DbSet<Match> Matches { get; set; }
        public DbSet<MatchPlayer> MatchPlayers { get; set; }
        public DbSet<Leg> Legs { get; set; }
        public DbSet<Turn> Turns { get; set; }
        public DbSet<Dart> Darts { get; set; }
        public DbSet<PlayerStats> PlayerStatsSet { get; set; }

        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Existing friendship relationship
            modelBuilder.Entity<Player>()
                .HasMany(p => p.Friends)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "PlayerFriendship",
                    j => j
                        .HasOne<Player>()
                        .WithMany()
                        .HasForeignKey("FriendId")
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j
                        .HasOne<Player>()
                        .WithMany()
                        .HasForeignKey("PlayerId")
                        .OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("PlayerId", "FriendId");
                        j.ToTable("PlayerFriendships");
                    });

            // Match → WinnerPlayer (optional)
            modelBuilder.Entity<Match>()
                .HasOne(m => m.WinnerPlayer)
                .WithMany()
                .HasForeignKey(m => m.WinnerPlayerID)
                .OnDelete(DeleteBehavior.SetNull);

            // Match → MatchPlayers
            modelBuilder.Entity<MatchPlayer>()
                .HasOne(mp => mp.Match)
                .WithMany(m => m.MatchPlayers)
                .HasForeignKey(mp => mp.MatchID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MatchPlayer>()
                .HasOne(mp => mp.Player)
                .WithMany()
                .HasForeignKey(mp => mp.PlayerID)
                .OnDelete(DeleteBehavior.Cascade);

            // Match → Legs
            modelBuilder.Entity<Leg>()
                .HasOne(l => l.Match)
                .WithMany(m => m.MatchLegs)
                .HasForeignKey(l => l.MatchID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Leg>()
                .HasOne(l => l.WinnerPlayer)
                .WithMany()
                .HasForeignKey(l => l.WinnerPlayerID)
                .OnDelete(DeleteBehavior.SetNull);

            // Leg → Turns
            modelBuilder.Entity<Turn>()
                .HasOne(t => t.Leg)
                .WithMany(l => l.Turns)
                .HasForeignKey(t => t.LegID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Turn>()
                .HasOne(t => t.MatchPlayer)
                .WithMany(mp => mp.Turns)
                .HasForeignKey(t => t.MatchPlayerID)
                .OnDelete(DeleteBehavior.Cascade);

            // Turn → Darts
            modelBuilder.Entity<Dart>()
                .HasOne(d => d.Turn)
                .WithMany(t => t.Darts)
                .HasForeignKey(d => d.TurnID)
                .OnDelete(DeleteBehavior.Cascade);

            // PlayerStats — one per player
            modelBuilder.Entity<PlayerStats>()
                .HasOne(ps => ps.Player)
                .WithMany()
                .HasForeignKey(ps => ps.PlayerID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlayerStats>()
                .HasIndex(ps => ps.PlayerID)
                .IsUnique();
        }
    }
}
