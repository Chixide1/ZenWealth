using Microsoft.AspNetCore.Identity;
using Server.Models;

namespace Server.Data.Services;

public interface ITransactionsService
{
    Task Sync(IdentityUser user);
    
    List<Transaction> GetAll(IdentityUser user);
}

public interface IAccountsService
{

}

public interface IItemsService
{
    void Add(string accessToken, IdentityUser user);
    
    bool Check(IdentityUser user);
}