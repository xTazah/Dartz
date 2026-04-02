using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dartz.Business.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Players",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "MemberSince",
                table: "Players",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePicture",
                table: "Players",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "MemberSince",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "ProfilePicture",
                table: "Players");
        }
    }
}
