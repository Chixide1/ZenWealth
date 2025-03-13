using Going.Plaid.Entity;
using Server.Data.DTOs;
using Server.Data.Models;

namespace Server.Services;

public interface IItemsService
{
    void CreateItem(string accessToken, string userId, string institutionName);
    
    Task<bool> CheckItemExistsAsync(string userId);
    
    Task<int> UpdateItemsAsync(string userId);
    
    Task<bool> DeleteItemAsync(string userId, int itemId);
    
    /// <summary>
    /// Exchanges a public token for an access token and creates a new item for the user
    /// </summary>
    /// <param name="publicToken">The public token to exchange</param>
    /// <param name="institutionName">The name of the institution</param>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A result containing success status, any errors, and number of added transactions</returns>
    Task<ItemTokenExchangeResult> ExchangePublicTokenAsync(string publicToken, string institutionName, string userId);
    
    /// <summary>
    /// Creates a link token for the given user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A result containing success status, link token, and any errors</returns>
    Task<LinkTokenResult> CreateLinkTokenAsync(string userId);
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