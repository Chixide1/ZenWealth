using Server.Common;
using Server.Data.Models;

namespace Server.Data.Services;

public interface IItemsService
{
    Task CreateItemAsync(string accessToken, string userId);
    
    Task<bool> CheckItemExistsAsync(string userId);
}

public interface IAccountsService
{
    Task<List<AccountDto>> GetUserAccountsAsync(string userId);
}

public interface ITransactionsService
{
    Task FetchLatestTransactionsAsync(string userId);
    
    Task<List<TransactionDto>> GetUserTransactionsAsync(string userId);
}

