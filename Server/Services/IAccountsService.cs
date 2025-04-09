using Server.Data.DTOs;

namespace Server.Services;

/// <summary>
/// Service used for the Transactions associated accounts management.
/// </summary>
public interface IAccountsService
{
    /// <summary>
    /// Gets the accounts for a user.
    /// </summary>
    Task<List<AccountDto>> GetAccountsAsync(string userId);

    /// <summary>
    /// Updates the balances for all accounts associated with a user.
    /// </summary>
    Task UpdateAccountsAsync(string userId);
}