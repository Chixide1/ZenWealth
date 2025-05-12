using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Models;

namespace ZenWealth.Core.Domain.Interfaces;

public interface IAccountRepository
{
    /// <summary>
    /// Gets all user accounts
    /// </summary>
    Task<List<AccountDto>> GetAccountsByUserIdAsync(string userId);
    
    /// <summary>
    /// Gets a dictionary with the Plaid ID as the key and the associated account as the value
    /// </summary>
    Task<Dictionary<string, Account>> GetAccountsByItemIdAsync(int itemId);
    
    /// <summary>
    /// Gets an Account through its Plaid ID
    /// </summary>
    Task<Account?> GetAccountByPlaidAccountIdAsync(string plaidAccountId);
    
    /// <summary>
    /// Saves changes on the attached account to the database
    /// </summary>
    Task AddAsync(Account account);
    
    /// <summary>
    /// Saves changes on the attached account to the database
    /// </summary>
    Task UpdateAccountAsync(Account account);
    
    /// <summary>
    /// Saves Changes to the database
    /// </summary>
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
    /// Gets all existing accounts IDs for an item
    /// </summary>
    Task<HashSet<string>> GetExistingAccountIdsAsync(int itemId);
    
    /// <summary>
    /// Gets a dictionary of Plaid Account IDs as keys to their associated accounts
    /// </summary>
    Task<Dictionary<string, int>> GetAccountMappingAsync(List<string?> accountIds);
}