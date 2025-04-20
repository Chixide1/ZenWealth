using Server.Data.Models;
using Server.Data.Models.Dtos;

namespace Server.Data.Repositories.Interfaces;

/// <summary>
/// Repository for managing Item data access
/// </summary>
public interface IItemRepository
{
    /// <summary>
    /// Checks if any items exist for the specified user
    /// </summary>
    Task<bool> ExistsForUserAsync(string userId);
    
    /// <summary>
    /// Gets all items for a specified user
    /// </summary>
    Task<IEnumerable<InstitutionDto>> GetItemsForUserAsync(string userId);
    
    /// <summary>
    /// Gets an item by its Plaid Item ID
    /// </summary>
    Task<Item?> GetByPlaidIdAsync(string plaidItemId);
    
    /// <summary>
    /// Gets an item with its accounts by its ID and user ID
    /// </summary>
    Task<Item?> GetWithAccountsByIdAndUserIdAsync(int itemId, string userId);
    
    /// <summary>
    /// Gets an item by its ID and user ID
    /// </summary>
    Task<Item?> GetByIdAndUserIdAsync(int itemId, string userId);
    
    /// <summary>
    /// Gets detailed item information by Plaid Item ID
    /// </summary>
    Task<ItemDetailsDto?> GetItemDetailsByPlaidIdAsync(string plaidItemId);
    
    /// <summary>
    /// Gets all items for a specified user that need to be updated
    /// </summary>
    Task<List<Item>> GetItemsForUpdateAsync(string userId);
    
    /// <summary>
    /// Creates a new item
    /// </summary>
    Task<Item> CreateAsync(Item item);
    
    /// <summary>
    /// Updates an existing item
    /// </summary>
    Task<Item> UpdateAsync(Item item);
    
    /// <summary>
    /// Deletes an item
    /// </summary>
    Task<bool> DeleteAsync(Item item);
    
    /// <summary>
    /// Gets all existing accounts for an item
    /// </summary>
    Task<HashSet<string>> GetExistingAccountIdsAsync(int itemId);
    
    /// <summary>
    /// Gets account mapping by Plaid Account IDs
    /// </summary>
    Task<Dictionary<string, int>> GetAccountMappingAsync(List<string?> accountIds);
    
    /// <summary>
    /// Gets existing transaction IDs
    /// </summary>
    Task<HashSet<string>> GetExistingTransactionIdsAsync(List<string?> transactionIds);
    
    /// <summary>
    /// Adds multiple accounts
    /// </summary>
    Task AddAccountsAsync(List<Account> accounts);
    
    /// <summary>
    /// Adds multiple transactions
    /// </summary>
    Task AddTransactionsAsync(List<Transaction> transactions);
    
    /// <summary>
    /// Removes multiple accounts
    /// </summary>
    Task RemoveAccountsAsync(List<Account> accounts);
    
    /// <summary>
    /// Saves all changes to the database
    /// </summary>
    Task SaveChangesAsync();
}
