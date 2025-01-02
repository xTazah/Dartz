using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dartz.Business.Migrations
{
    /// <inheritdoc />
    public partial class addedfriendList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "PlayerFriendships",
                columns: table => new
                {
                    PlayerId = table.Column<int>(type: "integer", nullable: false),
                    FriendId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerFriendships", x => new { x.PlayerId, x.FriendId });
                    table.ForeignKey(
                        name: "FK_PlayerFriendships_Players_FriendId",
                        column: x => x.FriendId,
                        principalTable: "Players",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayerFriendships_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlayerFriendships_FriendId",
                table: "PlayerFriendships",
                column: "FriendId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayerFriendships");

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
    }
}
