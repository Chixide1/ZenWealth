using Server.Common;
using Server.Data.Models;

namespace Server.Data.Services;

public interface IItemsService
{
    void CreateItem(string accessToken, string userId, string institutionName);
    
    Task<bool> CheckItemExistsAsync(string userId);
    
    Task<int> UpdateItemsAsync(string userId);
}

public interface IAccountsService
{
    Task<List<AccountDto>> GetUserAccountsAsync(string userId);
    
    Task UpdateAccountsAsync(string userId);
}

public interface ITransactionsService
{
    Task<List<TransactionDto>> GetTransactionsAsync(string userId,
        int id = 0,
        DateOnly date = new DateOnly(),
        int pageSize = 10,
        string? name = null,
        int? minAmount = null,
        int? maxAmount = null,
        DateOnly? beginDate = null,
        DateOnly? endDate = null,
        string? sort = null,
        int[]? excludeId = null,
        int? nextAmount = null
    );
    
    Task<List<MonthlySummary>> GetMonthlyIncomeAndOutcome(string userId);

    Task<RecentTransactions> GetRecentTransactions(string userId, int count = 11);
    
    Task<List<TopExpenseCategory>> GetTopExpenseCategories(string userId);
}

