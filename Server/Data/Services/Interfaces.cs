using Server.Common;
using Server.Data.Models;

namespace Server.Data.Services;

public interface IItemsService
{
    void Add(string accessToken, string userId);
    
    bool Check(string userId);
}

public interface IAccountsService
{

}

public interface ITransactionsService
{
    Task SyncAsync(string userId);
    
    Task<List<StrippedTransaction>> GetAllAsync(string userId);
}

