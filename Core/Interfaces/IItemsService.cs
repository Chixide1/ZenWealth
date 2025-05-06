using Core.Dtos;
using Core.Models;

namespace Core.Interfaces;

/// <summary>
/// Service used for item management.
/// </summary>
public interface IItemsService
{
    /// <summary>
    /// Checks if an Item exists for the specified user
    /// </summary>
    Task<bool> CheckItemExistsAsync(string userId);

    /// <summary>
    /// Gets an item & user using the plaid item id
    /// </summary>
    Task<ItemDetailsDto?> GetItemDetailsByPlaidIdAsync(string plaidItemId);
    
    /// <summary>
    /// Updates an item through the Item ID
    /// </summary>
    Task<int> UpdateItemByPlaidIdAsync(string plaidItemId);
    
    /// <summary>
    /// Asynchronously adds all new transactions for a specified user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user for whom transactions are to be synchronized.</param>
    /// <remarks>
    /// If the user has any items, this method will fetch transactions for each item and add them to the user's account.
    /// If an item was recently fetched, it will be skipped.
    /// It fetches updates using a cursor to track which updates have already been seen.
    /// </remarks>
    Task<int> UpdateItemsAsync(string userId);

    /// <summary>
    /// Updates the access token for the specified user's item
    /// </summary>
    Task<ItemTokenExchangeResponse> ExchangePublicTokenForReauthAsync(
        int itemId, string userId, UpdateItemReauthRequest request);
    
    /// <summary>
    /// Get all the institutions for a specified user
    /// </summary>
    Task<List<InstitutionDto>> GetItemsAsync(string userId);
    
    /// <summary>
    /// Deletes an item for a user.
    /// </summary>
    /// <param name="userId">The user ID of the user that the item belongs to.</param>
    /// <param name="itemId">The ID of the item to delete.</param>
    /// <returns>True if the item was deleted, false otherwise.</returns>
    Task<bool> DeleteItemAsync(string userId, int itemId);

    /// <summary>
    /// Exchanges a public token for an access token and creates a new item for the user
    /// </summary>
    /// <returns>A result containing success status, any errors, and the number of added transactions</returns>
    Task<ItemTokenExchangeResponse> ExchangePublicTokenAsync(string publicToken, string institutionName,
        string institutionId, string userId);
    
    /// <summary>
    /// Creates a link token for the given user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A result containing success status, link token, and any errors</returns>
    Task<LinkTokenResponse> CreateLinkTokenAsync(string userId);

    /// <summary>
    /// Creates a link token which will be used to update the provided item for the given user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="itemId">The ID of the item</param>
    /// <returns>A result containing success status, link token, and any errors</returns>
    Task<LinkTokenResponse> CreateUpdateLinkTokenAsync(string userId, int itemId);

    /// <summary>
    /// Removes an Item using its Plaid ID
    /// </summary>
    Task<bool> DeleteItemByPlaidItemIdAsync(string plaidItemId);
}