using Microsoft.AspNetCore.Identity;
using Server.Models;
using Server.Utils;

namespace Server.Data.Services;

public interface ITransactionsService
{
    Task Sync(IdentityUser user);
    
    List<StrippedTransaction> GetAll(IdentityUser user);
}

public interface IAccountsService
{

}

public interface IItemsService
{
    void Add(string accessToken, IdentityUser user);
    
    bool Check(IdentityUser user);
}