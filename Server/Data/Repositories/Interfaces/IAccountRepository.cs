using Server.Data.Models;
using Server.Data.Models.Dtos;

namespace Server.Data.Repositories.Interfaces;

public interface IAccountRepository
{
    Task<List<AccountDto>> GetAccountsByUserIdAsync(string userId);
    Task<Dictionary<string, Account>> GetAccountsByItemIdAsync(int itemId);
    Task<Account?> GetAccountByPlaidAccountIdAsync(string plaidAccountId);
    Task AddAccountAsync(Account account);
    Task UpdateAccountAsync(Account account);
    Task SaveChangesAsync();
}