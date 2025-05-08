// Core/Application/Interfaces/IPlaidService.cs

using Going.Plaid.Accounts;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;

namespace Core.Domain.Interfaces;

public interface IPlaidService
{
    // Item-related operations
    Task<ItemPublicTokenExchangeResponse> ExchangePublicTokenAsync(string publicToken);
    Task<LinkTokenCreateResponse> CreateLinkTokenAsync(string userId, string clientName, LinkTokenAccountFilters? accountFilters = null);
    Task<LinkTokenCreateResponse> CreateUpdateLinkTokenAsync(string userId, string accessToken, string clientName, LinkTokenAccountFilters? accountFilters = null);
    Task<ItemRemoveResponse> RemoveItemAsync(string accessToken);
    
    // Transaction operations
    Task<TransactionsSyncResponse> SyncTransactionsAsync(string accessToken, string? cursor = null);
    
    // Account operations
    Task<AccountsGetResponse> GetAccountsAsync(string accessToken);
    
    // General Plaid operations
    string? GetWebhookUrl();
}