using Going.Plaid.Entity;
using Server.Data.DTOs;
using Server.Data.Models;
using Item = Server.Data.Models.Item;

namespace Server.Services;

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
    /// Updates an item through the Item ID
    /// </summary>
    Task<int> UpdateItemByIdAsync(string plaidItemId);
    
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
    /// Update the access token for the specified user's item
    /// </summary>
    Task<ItemTokenExchangeResult> ExchangePublicTokenForReauthAsync(string publicToken, int itemId, string userId);
    
    /// <summary>
    /// Get all the institutions for a specified user
    /// </summary>
    Task<IEnumerable<InstitutionDto>> GetItemsAsync(string userId);
    
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
    /// <param name="publicToken">The public token to exchange</param>
    /// <param name="institutionName">The name of the institution</param>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A result containing success status, any errors, and the number of added transactions</returns>
    Task<ItemTokenExchangeResult> ExchangePublicTokenAsync(string publicToken, string institutionName, string userId);
    
    /// <summary>
    /// Creates a link token for the given user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A result containing success status, link token, and any errors</returns>
    Task<LinkTokenResult> CreateLinkTokenAsync(string userId);

    /// <summary>
    /// Creates a link token which will be used to update the provided item for the given user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="itemId">The ID of the item</param>
    /// <returns>A result containing success status, link token, and any errors</returns>
    Task<LinkTokenResult> CreateUpdateLinkTokenAsync(string userId, int itemId);
}

/// <summary>
/// Represents the result of exchanging a public token
/// </summary>
public class ItemTokenExchangeResult
{
    public bool IsSuccess { get; set; }
    public PlaidError? Error { get; set; }
    public int AddedTransactions { get; set; }
    
    public static ItemTokenExchangeResult Success(int addedTransactions) => 
        new() { IsSuccess = true, AddedTransactions = addedTransactions };
    
    public static ItemTokenExchangeResult Failure(PlaidError error) => 
        new() { IsSuccess = false, Error = error };
}

/// <summary>
/// Represents the result of creating a link token
/// </summary>
public class LinkTokenResult
{
    public bool IsSuccess { get; set; }
    public string? LinkToken { get; set; }
    public string? ErrorMessage { get; set; }
    public PlaidError? PlaidError { get; set; }
    
    public static LinkTokenResult Success(string linkToken) => 
        new() { IsSuccess = true, LinkToken = linkToken };
    
    public static LinkTokenResult Failure(string errorMessage, PlaidError? plaidError = null) => 
        new() { IsSuccess = false, ErrorMessage = errorMessage, PlaidError = plaidError };
}