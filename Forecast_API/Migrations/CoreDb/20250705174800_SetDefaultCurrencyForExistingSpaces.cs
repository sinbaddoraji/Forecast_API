using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Forecast_API.Migrations.CoreDb
{
    /// <inheritdoc />
    public partial class SetDefaultCurrencyForExistingSpaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing spaces to have USD as default currency
            migrationBuilder.Sql("UPDATE \"Spaces\" SET \"Currency\" = 'USD' WHERE \"Currency\" = '' OR \"Currency\" IS NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
