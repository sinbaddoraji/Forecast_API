using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Forecast_API.Migrations.CoreDb
{
    /// <inheritdoc />
    public partial class AddSavingsGoalTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SavingsGoalTransactions",
                columns: table => new
                {
                    TransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    GoalId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavingsGoalTransactions", x => x.TransactionId);
                    table.ForeignKey(
                        name: "FK_SavingsGoalTransactions_SavingsGoals_GoalId",
                        column: x => x.GoalId,
                        principalTable: "SavingsGoals",
                        principalColumn: "GoalId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SavingsGoalTransactions_Spaces_SpaceId",
                        column: x => x.SpaceId,
                        principalTable: "Spaces",
                        principalColumn: "SpaceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SavingsGoalTransactions_GoalId_Date",
                table: "SavingsGoalTransactions",
                columns: new[] { "GoalId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_SavingsGoalTransactions_SpaceId",
                table: "SavingsGoalTransactions",
                column: "SpaceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SavingsGoalTransactions");
        }
    }
}
