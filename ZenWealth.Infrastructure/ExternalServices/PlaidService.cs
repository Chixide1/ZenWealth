// Infrastructure/Services/PlaidService.cs

using System.Text.Json;
using ZenWealth.Core.Domain.Interfaces;
using Going.Plaid;
using Going.Plaid.Accounts;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ZenWealth.Infrastructure.ExternalServices;

internal class PlaidService(
    PlaidClient client,
    IConfiguration config,
    ILogger<PlaidService> logger)
    : IPlaidService
{
    public async Task<ItemPublicTokenExchangeResponse> ExchangePublicTokenAsync(string publicToken)
    {
        try
        {
            var response = await client.ItemPublicTokenExchangeAsync(new ItemPublicTokenExchangeRequest
            {
                PublicToken = publicToken
            });
            
            if (response.Error != null)
            {
                logger.LogError("Error exchanging public token: {ErrorMessage}", response.Error.ErrorMessage);
            }
            
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while exchanging public token");
            throw;
        }
    }

    public async Task<LinkTokenCreateResponse> CreateLinkTokenAsync(string userId, string clientName, LinkTokenAccountFilters? accountFilters = null)
    {
        try
        {
            var response = await client.LinkTokenCreateAsync(new LinkTokenCreateRequest
            {
                User = new LinkTokenCreateRequestUser
                {
                    ClientUserId = userId,
                },
                ClientName = clientName,
                Products = [Products.Transactions],
                Language = Language.English,
                CountryCodes = [CountryCode.Gb],
                Webhook = GetWebhookUrl(),
                AccountFilters = accountFilters,
            });

            if (response.Error != null)
            {
                logger.LogError("Error creating link token: {ErrorType} - {ErrorCode}: {ErrorMessage}",
                    response.Error.ErrorType, response.Error.ErrorCode, response.Error.ErrorMessage);
            }

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while creating link token for user {UserId}", userId);
            throw;
        }
    }

    public async Task<LinkTokenCreateResponse> CreateUpdateLinkTokenAsync(string userId, string accessToken, string clientName, LinkTokenAccountFilters? accountFilters = null)
    {
        try
        {
            var response = await client.LinkTokenCreateAsync(new LinkTokenCreateRequest
            {
                User = new LinkTokenCreateRequestUser
                {
                    ClientUserId = userId
                },
                ClientName = clientName,
                AccessToken = accessToken,
                Language = Language.English,
                CountryCodes = [CountryCode.Gb],
                Webhook = GetWebhookUrl(),
                AccountFilters = accountFilters,
                Update = new LinkTokenCreateRequestUpdate
                {
                    AccountSelectionEnabled = true
                }
            });

            if (response.Error != null)
            {
                logger.LogError("Error creating update link token: {ErrorType} - {ErrorCode}: {ErrorMessage}",
                    response.Error.ErrorType, response.Error.ErrorCode, response.Error.ErrorMessage);
            }

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while creating update link token for user {UserId}", userId);
            throw;
        }
    }

    public async Task<ItemRemoveResponse> RemoveItemAsync(string accessToken)
    {
        try
        {
            var response = await client.ItemRemoveAsync(new ItemRemoveRequest
            {
                AccessToken = accessToken,
            });

            if (response.Error != null)
            {
                logger.LogWarning("Unable to remove the item from Plaid: {Error}", response.Error);
            }
            
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while removing item");
            throw;
        }
    }

    public async Task<TransactionsSyncResponse> SyncTransactionsAsync(string accessToken, string? cursor = null)
    {
        try
        {
            var request = new TransactionsSyncRequest()
            {
                AccessToken = accessToken,
                Cursor = cursor
            };
            
            var response = await client.TransactionsSyncAsync(request);
            
            if (response.Error != null)
            {
                logger.LogError("Error syncing transactions: {ErrorMessage}", response.Error.ErrorMessage);
            }
            
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while syncing transactions");
            throw;
        }
    }

    public async Task<AccountsGetResponse> GetAccountsAsync(string accessToken)
    {
        
        try
        {
            var response = await client.AccountsGetAsync(new AccountsGetRequest
            {
                AccessToken = accessToken
            });
        
            if (response.Error != null)
            {
                logger.LogError("Error retrieving accounts from Plaid: {ErrorType} - {ErrorCode}: {ErrorMessage}",
                    response.Error.ErrorType, response.Error.ErrorCode, response.Error.ErrorMessage);
            }
        
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while retrieving accounts from Plaid");
            throw;
        }

    }

    public string? GetWebhookUrl()
    {
        var webhookUrl = config["Plaid:WebhookUrl"];
        if (string.IsNullOrEmpty(webhookUrl))
        {
            logger.LogWarning("Plaid:WebhookUrl is empty");
        }
        return webhookUrl;
    }
}