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
    Task<string?> GetAccountNameAsync(string accountId);
    
    Task<List<AccountDto>> GetAccountsAsync(string userId);
    
    Task UpdateAccountsAsync(string userId);
}

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

public interface IBudgetsService
{
    Task AddBudgetAsync(string userId, Budget budget);
    
    Task<List<Budget>> GetBudgetsAsync(string userId);
}