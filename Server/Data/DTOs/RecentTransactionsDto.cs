namespace Server.Data.DTOs;

public class RecentTransactionsDto
{
    public required List<TransactionDto> All { get; set; }
    public required List<TransactionDto> Income { get; set; }
    public required List<TransactionDto> Expenditure { get; set; }
}