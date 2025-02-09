using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class Indexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Transactions",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_Amount",
                table: "Transactions",
                column: "Amount");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_MerchantName",
                table: "Transactions",
                column: "MerchantName");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_Name",
                table: "Transactions",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_PersonalFinanceCategory",
                table: "Transactions",
                column: "PersonalFinanceCategory");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transactions_Amount",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_MerchantName",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_Name",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_PersonalFinanceCategory",
                table: "Transactions");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Transactions",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)");
        }
    }
}
