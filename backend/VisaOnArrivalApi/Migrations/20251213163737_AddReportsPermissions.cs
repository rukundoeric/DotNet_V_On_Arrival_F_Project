using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisaOnArrivalApi.Migrations
{
    /// <inheritdoc />
    public partial class AddReportsPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert reports.view permission if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'reports.view')
                BEGIN
                    INSERT INTO Permissions (Name, Description, Category, IsActive)
                    VALUES ('reports.view', 'View reports and analytics', 'reports', 1)
                END
            ");

            // Insert reports.export permission if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM Permissions WHERE Name = 'reports.export')
                BEGIN
                    INSERT INTO Permissions (Name, Description, Category, IsActive)
                    VALUES ('reports.export', 'Export reports data', 'reports', 1)
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Permissions WHERE Name IN ('reports.view', 'reports.export')");
        }
    }
}
