using Server.Data.DTOs;
using Server.Data.Models;

namespace Server.Services;

public interface ITransactionsService
{
    Task<List<TransactionDto>> GetTransactionsAsync(
        string userId,
        int id = 0,
        DateOnly date = new(),
        int pageSize = 10,
        string? name = null,
        decimal? minAmount = null,
        decimal? maxAmount = null,
        DateOnly? beginDate = null,
        DateOnly? endDate = null,
        string? sort = null,
        decimal? amount = null,
        string[]? excludeCategories = null,
        string[]? excludeAccounts = null
    );
    
    Task<List<MonthlySummary>> GetMonthlyIncomeAndOutcome(string userId);

    Task<RecentTransactions> GetRecentTransactions(string userId, int count = 11);
    
    Task<List<TopExpenseCategory>> GetTopExpenseCategories(string userId);
    
    Task<MinMaxAmount> GetMinMaxAmount(string userId);
}