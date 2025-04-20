using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Server.Data.Models.Dtos;
using Server.Data.Models.Params;
using Server.Data.Models.Responses;
using Server.Data.Repositories.Interfaces;
using Server.Services.Interfaces;
using Account = Server.Data.Models.Account;
using Item = Server.Data.Models.Item;
using Transaction = Server.Data.Models.Transaction;

namespace Server.Services.Implementations;

public class ItemsService(
    IItemRepository itemRepository,
    ILogger<ItemsService> logger,
    PlaidClient client,
    IConfiguration config) : IItemsService
{
    public async Task<bool> CheckItemExistsAsync(string userId)
    {
        var result = await itemRepository.ExistsForUserAsync(userId);
        logger.LogInformation("Checked if user {UserId} has an item", userId);
        
        return result;
    }

    public async Task<ItemDetailsDto?> GetItemDetailsByPlaidIdAsync(string plaidItemId)
    {
        return await itemRepository.GetItemDetailsByPlaidIdAsync(plaidItemId);
    }
    
    public async Task<int> UpdateItemByPlaidIdAsync(string plaidItemId)
    {
        var item = await itemRepository.GetByPlaidIdAsync(plaidItemId);

        if (item == null)
        {
            logger.LogWarning("Item {ItemId} not found", plaidItemId);
            return 0;
        }

        try
        {
            return await UpdateSingleItemAsync(item.Id, item.UserId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating item {ItemId} for user {UserId}", plaidItemId, item.UserId);
            throw;
        }
    }
    
    public async Task<int> UpdateItemsAsync(string userId)
    {
        var updatedCount = 0;
        var items = await itemRepository.GetItemsForUpdateAsync(userId);

        foreach (var item in items)
        {
            if (ShouldSkipItemUpdate(item))
            {
                logger.LogInformation("Skipping item {ItemId} for user {UserId} as it was recently fetched", 
                    item.Id, userId);
                continue;
            }

            try
            {
                var transactionsAdded = await UpdateSingleItemAsync(item.Id, userId);
                updatedCount += transactionsAdded;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update item {ItemId} for user {UserId}", item.Id, userId);
                // Continue with other items instead of failing the entire batch
            }
        }

        return updatedCount;
    }

    public async Task<ItemTokenExchangeResponse> ExchangePublicTokenForReauthAsync(ReauthParams reauthParams)
    {
        var (publicToken, itemId, userId, accounts) = reauthParams;
        
        try
        {
            // Find the item with its accounts
            var item = await itemRepository.GetWithAccountsByIdAndUserIdAsync(itemId, userId);
    
            if (item == null)
            {
                logger.LogWarning("Item {ItemId} not found for user {UserId}", itemId, userId);
                return ItemTokenExchangeResponse.Failure(new PlaidError
                {
                    ErrorType = "INVALID_REQUEST",
                    ErrorCode = "ITEM_NOT_FOUND",
                    ErrorMessage = $"Item with ID {itemId} not found"
                });
            }
            
            // Exchange public token
            var response = await client.ItemPublicTokenExchangeAsync(new ItemPublicTokenExchangeRequest
            {
                PublicToken = publicToken
            });
    
            if (response.Error != null)
            {
                logger.LogError("Token exchange failed: {ErrorMessage}", response.Error.ErrorMessage);
                return ItemTokenExchangeResponse.Failure(response.Error);
            }
            
            // Update item
            item.AccessToken = response.AccessToken;
            item.Cursor = null;
            item.LastFetched = null;
    
            // Use ExceptBy to find accounts to remove
            var newAccountKeys = accounts.Select(a => new { a.Name, a.Mask });
            var accountsToRemove = item.Accounts
                .ExceptBy(newAccountKeys, a => new { a.Name, a.Mask }!)
                .ToList();
    
            // Remove obsolete accounts
            await itemRepository.RemoveAccountsAsync(accountsToRemove);
            
            // Update the item
            await itemRepository.UpdateAsync(item);
            
            // Log removed accounts
            logger.LogInformation("Removed accounts {@RemovedAccountIds} for item {ItemId} for user {UserId}",
                accountsToRemove.Select(a => new {a.Id, a.Name}), itemId, userId);
            
            // Sync fresh data
            var addedTransactions = await UpdateSingleItemAsync(item.Id, userId);
            
            logger.LogInformation("Reauthentication successful for item {ItemId}", itemId);
            return ItemTokenExchangeResponse.Success(addedTransactions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Reauthentication failed for item {ItemId}", itemId);
            return ItemTokenExchangeResponse.Failure(new PlaidError
            {
                ErrorType = "API_ERROR",
                ErrorCode = "INTERNAL_SERVER_ERROR",
                ErrorMessage = "An unexpected error occurred"
            });
        }
    }
    
    public async Task<IEnumerable<InstitutionDto>> GetItemsAsync(string userId)
    {
        return await itemRepository.GetItemsForUserAsync(userId);
    }
    
    public async Task<bool> DeleteItemAsync(string userId, int itemId)
    {
        var item = await itemRepository.GetByIdAndUserIdAsync(itemId, userId);

        if (item == null)
        {
            return false;
        }

        var response = await client.ItemRemoveAsync(new ItemRemoveRequest
        {
            AccessToken = item.AccessToken,
        });

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Unable to delete item {itemId} for user {UserId}: {Error}", itemId, userId, response.Error);
            return false;
        }
        
        await itemRepository.DeleteAsync(item);
        
        logger.LogInformation("Deleted item {ItemId} for user {UserId}", itemId, userId);
            
        return true;
    }
    
    public async Task<ItemTokenExchangeResponse> ExchangePublicTokenAsync(string publicToken, string institutionName, string institutionId, string userId)
    {
        try
        {
            // Check if this institution is already linked for this user
            var items = await itemRepository.GetItemsForUserAsync(userId);
            var existingItem = items.FirstOrDefault(i => i.Name == institutionName);
                
            if (existingItem != null)
            {
                logger.LogWarning("User {UserId} attempted to add duplicate institution {InstitutionId}", userId, institutionId);
                return ItemTokenExchangeResponse.Failure(new PlaidError
                {
                    ErrorType = "DUPLICATE_ITEM",
                    ErrorCode = "INSTITUTION_ALREADY_LINKED",
                    ErrorMessage = $"Institution '{institutionName}' is already linked to your account."
                });
            }
    
            var response = await client.ItemPublicTokenExchangeAsync(new ItemPublicTokenExchangeRequest
            {
                PublicToken = publicToken
            });
    
            if (response.Error != null)
            {
                logger.LogError("Error exchanging public token: {ErrorMessage}", response.Error.ErrorMessage);
                return ItemTokenExchangeResponse.Failure(response.Error);
            }
    
            await CreateItemAsync(response.AccessToken, userId, institutionName, response.ItemId, institutionId);
    
            // Wait briefly before updating items to ensure the item is created
            await Task.Delay(1000);
    
            var addedTransactions = await UpdateItemsAsync(userId);
            
            logger.LogInformation("Successfully exchanged public token for user {UserId} with {AddedTransactions} transactions", 
                userId, addedTransactions);
                    
            return ItemTokenExchangeResponse.Success(addedTransactions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while exchanging public token for user {UserId}", userId);
            return ItemTokenExchangeResponse.Failure(new PlaidError
            {
                ErrorType = "API_ERROR",
                ErrorCode = "INTERNAL_SERVER_ERROR",
                ErrorMessage = "An unexpected error occurred while processing your request."
            });
        }
    }
    
    public async Task<LinkTokenResponse> CreateLinkTokenAsync(string userId)
    {
        var webhookUrl = config["Plaid:WebhookUrl"];
        
        try
        {
            var response = await client.LinkTokenCreateAsync(new LinkTokenCreateRequest
            {
                User = new LinkTokenCreateRequestUser
                {
                    ClientUserId = userId
                },
                ClientName = "ZenWealth",
                Products = [Products.Transactions],
                Language = Language.English,
                CountryCodes = [CountryCode.Gb],
                Webhook = webhookUrl,
                AccountFilters = new LinkTokenAccountFilters
                {
                    Depository = new DepositoryFilter
                    {
                        AccountSubtypes = [DepositoryAccountSubtype.All]
                    },
                    Credit = new CreditFilter
                    {
                        AccountSubtypes = [CreditAccountSubtype.All]
                    },
                    Other = new OtherFilter
                    {
                        AccountSubtypes = [OtherAccountSubtype.All]
                    }
                }
            });

            if (response.Error != null)
            {
                logger.LogError("Error creating link token: {ErrorType} - {ErrorCode}: {ErrorMessage}",
                    response.Error.ErrorType, response.Error.ErrorCode, response.Error.ErrorMessage);
                
                return LinkTokenResponse.Failure(
                    $"Unable to create link token: {response.Error.ErrorMessage}", 
                    response.Error);
            }

            logger.LogInformation("Successfully created link token for user {UserId}", userId);
            return LinkTokenResponse.Success(response.LinkToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while creating link token for user {UserId}", userId);
            return LinkTokenResponse.Failure("An unexpected error occurred while creating the link token");
        }
    }
    
    public async Task<LinkTokenResponse> CreateUpdateLinkTokenAsync(string userId, int itemId)
    {
        try
        {
            // Find the item and ensure it belongs to the user
            var item = await itemRepository.GetByIdAndUserIdAsync(itemId, userId);
                
            if (item == null)
            {
                logger.LogWarning("Item {ItemId} not found for user {UserId}", itemId, userId);
                return LinkTokenResponse.Failure($"Item with ID {itemId} not found");
            }
            
            var webhookUrl = config["Plaid:WebhookUrl"];
            
            var response = await client.LinkTokenCreateAsync(new LinkTokenCreateRequest
            {
                User = new LinkTokenCreateRequestUser
                {
                    ClientUserId = userId
                },
                ClientName = "ZenWealth",
                AccessToken = item.AccessToken,
                Language = Language.English,
                CountryCodes = [CountryCode.Gb],
                Webhook = webhookUrl,
                AccountFilters = new LinkTokenAccountFilters
                {
                    Depository = new DepositoryFilter
                    {
                        AccountSubtypes = [DepositoryAccountSubtype.All]
                    },
                    Credit = new CreditFilter
                    {
                        AccountSubtypes = [CreditAccountSubtype.All]
                    },
                    Other = new OtherFilter
                    {
                        AccountSubtypes = [OtherAccountSubtype.All]
                    }
                },
                Update = new LinkTokenCreateRequestUpdate
                {
                    AccountSelectionEnabled = true
                }
            });

            if (response.Error != null)
            {
                logger.LogError("Error creating update link token: {ErrorType} - {ErrorCode}: {ErrorMessage}",
                    response.Error.ErrorType, response.Error.ErrorCode, response.Error.ErrorMessage);
                
                return LinkTokenResponse.Failure(
                    $"Unable to create update link token: {response.Error.ErrorMessage}", 
                    response.Error);
            }

            logger.LogInformation("Successfully created update link token for user {UserId} and item {ItemId}", 
                userId, itemId);
            return LinkTokenResponse.Success(response.LinkToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while creating update link token for user {UserId} and item {ItemId}", 
                userId, itemId);
            return LinkTokenResponse.Failure("An unexpected error occurred while creating the update link token");
        }
    }

    public async Task<bool> DeleteItemByPlaidItemIdAsync(string plaidItemId)
    {
        var item = await itemRepository.GetByPlaidIdAsync(plaidItemId);

        if (item == null)
        {
            logger.LogWarning("Unable to find item with the Plaid Identifier {PlaidItemId}", plaidItemId);
            return false;
        }
        
        await itemRepository.DeleteAsync(item);
        
        logger.LogInformation("Deleted item {ItemId} for user {UserId} for institution {InstitutionName}",
            item.Id, item.UserId, item.InstitutionName);
        return true;
    }
    
    private async Task CreateItemAsync(string accessToken, string userId, string institutionName, string itemId, string institutionId)
    {
        var item = new Item
        {
            AccessToken = accessToken,
            UserId = userId,
            InstitutionName = institutionName,
            InstitutionId = institutionId,
            PlaidItemId = itemId
        };
        
        await itemRepository.CreateAsync(item);
        logger.LogInformation("Added item for user {UserId} for institution {InstitutionId}", userId, institutionId);
    }

    // Core update method that both public methods will use
    private async Task<int> UpdateSingleItemAsync(int itemId, string userId)
    {
        var updatedCount = 0;
        var item = await itemRepository.GetByIdAndUserIdAsync(itemId, userId);

        if (item == null)
        {
            logger.LogWarning("Item {ItemId} not found for user {UserId}", itemId, userId);
            return 0;
        }

        logger.LogInformation("Updating item {item} for institution {institution} and user {user}", 
            item.Id, item.InstitutionName, userId);

        var hasMore = true;

        while (hasMore)
        {
            try
            {
                var request = new TransactionsSyncRequest()
                {
                    AccessToken = item.AccessToken,
                    Cursor = item.Cursor
                };
                
                var data = await client.TransactionsSyncAsync(request);
                
                item.Cursor = string.IsNullOrEmpty(data.NextCursor) ? null : data.NextCursor;
                item.LastFetched = string.IsNullOrEmpty(item.Cursor) ? null : DateTime.Now;
                hasMore = data.HasMore;
                
                await itemRepository.UpdateAsync(item);

                logger.LogInformation("Fetched {TransactionCount} transactions for item {ItemId} and user {UserId}",
                    data.Added.Count, item.Id, userId
                );

                // Process accounts
                await ProcessAccountsAsync(data.Accounts, item.Id, userId);
                
                // Process transactions
                var addedCount = await ProcessTransactionsAsync(data.Added, userId);
                updatedCount += addedCount;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing transactions for item {ItemId} and user {UserId}", 
                    item.Id, userId);
                throw;
            }
        }

        return updatedCount;
    }

    private async Task ProcessAccountsAsync(IReadOnlyList<Going.Plaid.Entity.Account> accounts, int itemId, string userId)
    {
        if (accounts.Count == 0)
        {
            return;
        }

        // Get all existing account IDs in one query
        var existingAccountIds = await itemRepository.GetExistingAccountIdsAsync(itemId);

        var newAccounts = new List<Account>();
    
        foreach (var account in accounts)
        {
            if (existingAccountIds.Contains(account.AccountId))
            {
                logger.LogInformation(
                    "Skipping account {PlaidAccountId} for item {ItemId} and user {UserId} as it already exists",
                    account.AccountId, itemId, userId
                );
                continue;
            }

            newAccounts.Add(new Account
            {
                PlaidAccountId = account.AccountId,
                ItemId = itemId,
                UserId = userId,
                Name = account.Name,
                Type = account.Type.ToString(),
                CurrentBalance = account.Balances.Current ?? 0,
                AvailableBalance = account.Balances.Available ?? 0,
                Mask = account.Mask,
                Subtype = account.Subtype.ToString(),
                OfficialName = account.OfficialName,
            });
        }
    
        if (newAccounts.Count > 0)
        {
            await itemRepository.AddAccountsAsync(newAccounts);
            logger.LogInformation("Added {AccountCount} new accounts for item {ItemId} and user {UserId}",
                newAccounts.Count, itemId, userId);
        }
    }

    private async Task<int> ProcessTransactionsAsync(IReadOnlyList<Going.Plaid.Entity.Transaction> transactions, string userId)
    {
        if (transactions.Count == 0)
        {
            return 0;
        }
    
        var sortedTransactions = transactions.OrderBy(t => t.Date).ToList();
        
        // Get all transaction IDs in one query
        var transactionIds = sortedTransactions
            .Select(t => t.TransactionId)
            .Where(id => id != null)
            .ToList();
        
        var existingTransactionIds = await itemRepository.GetExistingTransactionIdsAsync(transactionIds);
    
        // Get account mapping in one query
        var accountIds = sortedTransactions
            .Select(t => t.AccountId)
            .Distinct()
            .ToList();
        
        var accountMapping = await itemRepository.GetAccountMappingAsync(accountIds);
    
        var newTransactions = new List<Transaction>();
        
        foreach (var transaction in sortedTransactions)
        {
            if (transaction.TransactionId == null || existingTransactionIds.Contains(transaction.TransactionId))
            {
                continue;
            }
    
            if (!accountMapping.TryGetValue(transaction.AccountId ?? string.Empty, out var accountId))
            {
                logger.LogInformation(
                    "Skipping transaction {PlaidTransactionId} for user {UserId} as the account does not exist",
                    transaction.TransactionId, userId
                );
                continue;
            }
    
            newTransactions.Add(new Transaction()
            {
                PlaidTransactionId = transaction.TransactionId,
                AccountId = accountId,
                UserId = userId,
                Name = transaction.Name ?? "",
                Amount = transaction.Amount ?? new decimal(0.00),
                Date = transaction.Date ?? new DateOnly(),
                Datetime = transaction.Datetime,
                Website = transaction.Website,
                Category = transaction.PersonalFinanceCategory?.Primary ?? "OTHER",
                CategoryIconUrl = transaction.PersonalFinanceCategoryIconUrl,
                IsoCurrencyCode = transaction.IsoCurrencyCode ?? transaction.UnofficialCurrencyCode,
                LogoUrl = transaction.LogoUrl,
                MerchantName = transaction.MerchantName,
                PaymentChannel = transaction.PaymentChannel.ToString(),
                TransactionCode = transaction.TransactionCode == null
                    ? null
                    : transaction.TransactionCode.ToString(),
            });
        }
    
        if (newTransactions.Count <= 0) return newTransactions.Count;
    
        await itemRepository.AddTransactionsAsync(newTransactions);
            
        logger.LogInformation("Added {TransactionCount} new transactions for user {UserId}",
            newTransactions.Count, userId);
    
        return newTransactions.Count;
    }
    
    private static bool ShouldSkipItemUpdate(Item item)
    {
        return item.LastFetched != null && DateTime.Now.AddDays(-1) < item.LastFetched;
    }
}