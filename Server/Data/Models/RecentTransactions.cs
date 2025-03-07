using Server.Data.DTOs;

namespace Server.Data.Models;

public class RecentTransactions
{
    public required List<TransactionDto> All { get; set; }
    public required List<TransactionDto> Income { get; set; }
    public required List<TransactionDto> Expenditure { get; set; }
}