using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZenWealth.Infrastructure.Persistence.Migrations.SqlServer
{
    /// <inheritdoc />
    public partial class o : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PlaidTransactionId",
                table: "Transactions",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(100)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Transactions",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(255)");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Transactions",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "OTHER",
                oldClrType: typeof(string),
                oldType: "varchar(255)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PlaidTransactionId",
                table: "Transactions",
                type: "varchar(100)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Transactions",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Transactions",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldDefaultValue: "OTHER");
        }
    }
}
