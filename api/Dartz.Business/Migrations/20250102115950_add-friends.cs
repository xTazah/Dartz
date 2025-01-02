using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dartz.Business.Migrations
{
    /// <inheritdoc />
    public partial class addfriends : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PlayerID",
                table: "Players",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Players_PlayerID",
                table: "Players",
                column: "PlayerID");

            migrationBuilder.AddForeignKey(
                name: "FK_Players_Players_PlayerID",
                table: "Players",
                column: "PlayerID",
                principalTable: "Players",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Players_Players_PlayerID",
                table: "Players");

            migrationBuilder.DropIndex(
                name: "IX_Players_PlayerID",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "PlayerID",
                table: "Players");
        }
    }
}
