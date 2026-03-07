using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Dartz.Business.Migrations
{
    /// <inheritdoc />
    public partial class MatchHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GameModeKey = table.Column<string>(type: "text", nullable: false),
                    Sets = table.Column<int>(type: "integer", nullable: false),
                    Legs = table.Column<int>(type: "integer", nullable: false),
                    WinnerPlayerID = table.Column<int>(type: "integer", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Matches_Players_WinnerPlayerID",
                        column: x => x.WinnerPlayerID,
                        principalTable: "Players",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PlayerStatsSet",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlayerID = table.Column<int>(type: "integer", nullable: false),
                    TotalMatches = table.Column<int>(type: "integer", nullable: false),
                    TotalWins = table.Column<int>(type: "integer", nullable: false),
                    TotalLegs = table.Column<int>(type: "integer", nullable: false),
                    TotalLegsWon = table.Column<int>(type: "integer", nullable: false),
                    TotalTurns = table.Column<int>(type: "integer", nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    OverallAverage = table.Column<double>(type: "double precision", nullable: false),
                    HighestTurnScore = table.Column<int>(type: "integer", nullable: false),
                    Count100Plus = table.Column<int>(type: "integer", nullable: false),
                    Count140Plus = table.Column<int>(type: "integer", nullable: false),
                    Count180s = table.Column<int>(type: "integer", nullable: false),
                    BestLegDarts = table.Column<int>(type: "integer", nullable: true),
                    LastPlayedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerStatsSet", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PlayerStatsSet_Players_PlayerID",
                        column: x => x.PlayerID,
                        principalTable: "Players",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Legs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatchID = table.Column<int>(type: "integer", nullable: false),
                    LegNumber = table.Column<int>(type: "integer", nullable: false),
                    WinnerPlayerID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Legs", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Legs_Matches_MatchID",
                        column: x => x.MatchID,
                        principalTable: "Matches",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Legs_Players_WinnerPlayerID",
                        column: x => x.WinnerPlayerID,
                        principalTable: "Players",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MatchPlayers",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatchID = table.Column<int>(type: "integer", nullable: false),
                    PlayerID = table.Column<int>(type: "integer", nullable: false),
                    PlayerIndex = table.Column<int>(type: "integer", nullable: false),
                    FinalSets = table.Column<int>(type: "integer", nullable: false),
                    FinalLegs = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchPlayers", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MatchPlayers_Matches_MatchID",
                        column: x => x.MatchID,
                        principalTable: "Matches",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchPlayers_Players_PlayerID",
                        column: x => x.PlayerID,
                        principalTable: "Players",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Turns",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LegID = table.Column<int>(type: "integer", nullable: false),
                    MatchPlayerID = table.Column<int>(type: "integer", nullable: false),
                    TurnNumber = table.Column<int>(type: "integer", nullable: false),
                    ScoreBefore = table.Column<int>(type: "integer", nullable: false),
                    ScoreAfter = table.Column<int>(type: "integer", nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    IsBust = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turns", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Turns_Legs_LegID",
                        column: x => x.LegID,
                        principalTable: "Legs",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Turns_MatchPlayers_MatchPlayerID",
                        column: x => x.MatchPlayerID,
                        principalTable: "MatchPlayers",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Darts",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TurnID = table.Column<int>(type: "integer", nullable: false),
                    DartNumber = table.Column<int>(type: "integer", nullable: false),
                    BaseScore = table.Column<int>(type: "integer", nullable: false),
                    Multiplier = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Darts", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Darts_Turns_TurnID",
                        column: x => x.TurnID,
                        principalTable: "Turns",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Darts_TurnID",
                table: "Darts",
                column: "TurnID");

            migrationBuilder.CreateIndex(
                name: "IX_Legs_MatchID",
                table: "Legs",
                column: "MatchID");

            migrationBuilder.CreateIndex(
                name: "IX_Legs_WinnerPlayerID",
                table: "Legs",
                column: "WinnerPlayerID");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_WinnerPlayerID",
                table: "Matches",
                column: "WinnerPlayerID");

            migrationBuilder.CreateIndex(
                name: "IX_MatchPlayers_MatchID",
                table: "MatchPlayers",
                column: "MatchID");

            migrationBuilder.CreateIndex(
                name: "IX_MatchPlayers_PlayerID",
                table: "MatchPlayers",
                column: "PlayerID");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerStatsSet_PlayerID",
                table: "PlayerStatsSet",
                column: "PlayerID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Turns_LegID",
                table: "Turns",
                column: "LegID");

            migrationBuilder.CreateIndex(
                name: "IX_Turns_MatchPlayerID",
                table: "Turns",
                column: "MatchPlayerID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Darts");

            migrationBuilder.DropTable(
                name: "PlayerStatsSet");

            migrationBuilder.DropTable(
                name: "Turns");

            migrationBuilder.DropTable(
                name: "Legs");

            migrationBuilder.DropTable(
                name: "MatchPlayers");

            migrationBuilder.DropTable(
                name: "Matches");
        }
    }
}
