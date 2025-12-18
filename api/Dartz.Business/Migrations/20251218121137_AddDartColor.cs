using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dartz.Business.Migrations
{
    /// <inheritdoc />
    public partial class AddDartColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DartColor",
                table: "PlayerSettings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DartColor",
                table: "PlayerSettings");
        }
    }
}
