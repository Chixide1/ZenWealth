using Server.Common;
using Server.Data.Models;

namespace Server.Data.Services;

public interface IItemsService
{
    Task CreateItemAsync(string accessToken, string userId, string institutionName);
    
    Task<bool> CheckItemExistsAsync(string userId);
    
    Task UpdateItemsAsync(string userId);
}

public interface IAccountsService
{
    Task<List<AccountDto>> GetUserAccountsAsync(string userId);
    
    Task UpdateAccountsAsync(string userId);
}

public interface ITransactionsService
{
    Task<List<TransactionDto>> GetTransactionsAsync(string userId, int cursor = 1, int pageSize = 10);
    
    Task<List<MonthlySummary>> GetMonthlyIncomeAndOutcome(string userId);

    Task<RecentTransactions> GetRecentTransactions(string userId, int count = 11);
    
    Task<List<TopExpenseCategory>> GetTopExpenseCategories(string userId);
}

