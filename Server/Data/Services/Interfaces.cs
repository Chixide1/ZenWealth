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
    Task<List<TransactionDto>> GetUserTransactionsAsync(string userId, int cursor = 1, int pageSize = 10);
    
    Task<List<MonthlySummary>> MonthlyIncomeAndOutcome(string userId);
}

