using Core.Models;

namespace Core.Application.Interfaces;

/// <summary>
/// Service used for the Transactions associated accounts management.
/// </summary>
public interface IAccountsService
{
    /// <summary>
    /// Asynchronously retrieves all accounts for a specified user and returns them as a list of account DTOs.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose accounts are to be retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing a list of account DTOs for the user.</returns>
    Task<List<AccountDto>> GetAccountsAsync(string userId);

    /// <summary>
    /// Updates all associated item accounts
    /// </summary>
    /// <param name="plaidItemId">The unique identifier of the item from Plaid</param>
    /// <returns>The count of accounts that have been processed.</returns>
    Task<int> UpdateAccountsByPlaidItemIdAsync(string plaidItemId);
    
    /// <summary>
    /// Asynchronously updates the accounts for a specified user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose accounts are to be updated.</param>
    /// <remarks>
    /// This method retrieves items associated with the user that were fetched within the last day.
    /// For each item, it fetches account data using the Plaid API. If an account already exists in the database,
    /// its current balance is updated. Otherwise, a new account is added to the database.
    /// </remarks>
    Task UpdateAccountsAsync(string userId);
}