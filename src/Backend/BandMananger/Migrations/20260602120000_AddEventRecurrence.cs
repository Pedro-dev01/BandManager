using BandMananger.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BandMananger.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260602120000_AddEventRecurrence")]
    public partial class AddEventRecurrence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventRecurrences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRecurrences", x => x.Id);
                });

            migrationBuilder.AddColumn<Guid>(
                name: "RecurrenceId",
                table: "Events",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_RecurrenceId",
                table: "Events",
                column: "RecurrenceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_EventRecurrences_RecurrenceId",
                table: "Events",
                column: "RecurrenceId",
                principalTable: "EventRecurrences",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_EventRecurrences_RecurrenceId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_RecurrenceId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "RecurrenceId",
                table: "Events");

            migrationBuilder.DropTable(
                name: "EventRecurrences");
        }
    }
}
