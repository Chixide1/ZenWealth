using Server.Data.Entities;
using Server.Data.Models;
using Server.Data.Models.Dtos;

namespace Server.Data.Repositories.Interfaces;

public interface IAccountRepository
{
    Task<List<AccountDto>> GetAccountsByUserIdAsync(string userId);
    Task<Dictionary<string, Account>> GetAccountsByItemIdAsync(int itemId);
    Task<Account?> GetAccountByPlaidAccountIdAsync(string plaidAccountId);
    Task AddAsync(Account account);
    Task UpdateAccountAsync(Account account);
    Task SaveChangesAsync();
    
    /// <summary>
    /// Adds multiple accounts
    /// </summary>
    Task AddRangeAsync(List<Account> accounts);
    
    /// <summary>
    /// Removes multiple accounts
    /// </summary>
    Task RemoveRangeAsync(List<Account> accounts);
    
    /// <summary>
    /// Gets all existing accounts for an item
    /// </summary>
    Task<HashSet<string>> GetExistingAccountIdsAsync(int itemId);
    
    /// <summary>
    /// Gets account mapping by Plaid Account IDs
    /// </summary>
    Task<Dictionary<string, int>> GetAccountMappingAsync(List<string?> accountIds);
}