using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dartz.Business.Migrations
{
    /// <inheritdoc />
    public partial class AddExtendedPlayerStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "BestMatchAverage",
                table: "PlayerStatsSet",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "CurrentWinStreak",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "First9Average",
                table: "PlayerStatsSet",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "HighestCheckout",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LongestWinStreak",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalBusts",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalCheckoutAttempts",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalCheckouts",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalDarts",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalFirst9Points",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalFirst9Turns",
                table: "PlayerStatsSet",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "WorstMatchAverage",
                table: "PlayerStatsSet",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BestMatchAverage",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "CurrentWinStreak",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "First9Average",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "HighestCheckout",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "LongestWinStreak",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "TotalBusts",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "TotalCheckoutAttempts",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "TotalCheckouts",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "TotalDarts",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "TotalFirst9Points",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "TotalFirst9Turns",
                table: "PlayerStatsSet");

            migrationBuilder.DropColumn(
                name: "WorstMatchAverage",
                table: "PlayerStatsSet");
        }
    }
}
