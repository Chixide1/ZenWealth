using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ZenWealth.Core.Application.Interfaces;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Dtos;
using ZenWealth.Core.Models;
using Account = ZenWealth.Core.Domain.Entities.Account;
using Entities_Account = ZenWealth.Core.Domain.Entities.Account;
using Entities_Item = ZenWealth.Core.Domain.Entities.Item;
using Entities_Transaction = ZenWealth.Core.Domain.Entities.Transaction;
using Item = ZenWealth.Core.Domain.Entities.Item;
using PlaidAccount = Going.Plaid.Entity.Account;
using PlaidTransaction = Going.Plaid.Entity.Transaction;
using Transaction = ZenWealth.Core.Domain.Entities.Transaction;

namespace ZenWealth.Core.Application.Services;

internal class ItemService(
    IItemRepository itemRepository,
    IAccountRepository accountRepository,
    ITransactionRepository transactionRepository,
    ILogger<ItemService> logger,
    IPlaidService plaidService,
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
        var itemDetails = await itemRepository.GetItemDetailsByPlaidIdAsync(plaidItemId);

        if (itemDetails == null)
        {
            logger.LogWarning("Unable to retrieve item details using Plaid Item ID: {PlaidItemId}", plaidItemId);
            return null;
        }
        
        logger.LogInformation("Retrieved item details for user {UserId} with (Plaid Item ID: {PlaidItemId})",
            itemDetails.UserId, plaidItemId);
        return itemDetails;
    }
    
    public async Task<int> UpdateItemByPlaidIdAsync(string plaidItemId)
    {
        var item = await itemRepository.GetByPlaidIdAsync(plaidItemId);

        if (item == null)
        {
            logger.LogWarning("Item {PlaidItemId} not found", plaidItemId);
            return 0;
        }

        try
        {
            return await UpdateSingleItemAsync(item.Id, item.UserId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating item {PlaidItemId} for user {UserId}", plaidItemId, item.UserId);
            throw;
        }
    }
    
    public async Task<int> UpdateItemsAsync(string userId)
    {
        var updatedCount = 0;
        var items = await itemRepository.GetItemsForUpdateAsync(userId);
        logger.LogInformation("Retrieved {ItemCount} items for user {UserId}", items.Count, userId);

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
                logger.LogInformation("Added {TransactionCount} transactions for item {ItemId} for user {UserId}", 
                    transactionsAdded, item.Id, userId);
                
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

    public async Task<ItemTokenExchangeResponse> ExchangePublicTokenForReauthAsync(
        int itemId, string userId, UpdateItemReauthRequest request)
    {
        var (publicToken, accounts) = request;
        
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
            var response = await plaidService.ExchangePublicTokenAsync(publicToken);
    
            if (response.Error != null)
            {
                logger.LogError("Token exchange failed: {ErrorMessage}", response.Error.ErrorMessage);
                return ItemTokenExchangeResponse.Failure(response.Error);
            }
    
            // Use ExceptBy to find accounts to remove
            var newAccountKeys = accounts.Select(a => new { a.Name, a.Mask });
            var accountsToRemove = item.Accounts
                .ExceptBy(newAccountKeys, a => new { a.Name, a.Mask }!)
                .ToList();
    
            // Remove obsolete accounts
            await accountRepository.RemoveRangeAsync(accountsToRemove);
            logger.LogInformation("Removed accounts {@RemovedAccountIds} for item {ItemId} for user {UserId}",
                accountsToRemove.Select(a => new {a.Id, a.Name}), itemId, userId);
            
            // Update the item
            item.AccessToken = response.AccessToken;
            item.Cursor = null;
            item.LastFetched = null;
            
            await itemRepository.UpdateAsync(item);
            logger.LogInformation("The item {ItemId} for user {UserId} has been updated with a new Access Token",
                item.Id, userId);
            
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
    
    public async Task<List<InstitutionDto>> GetItemsAsync(string userId)
    {
        var institutions = await itemRepository.GetInstitutionsForUserAsync(userId);
        logger.LogInformation("Retrieved {InstitutionsCount} institutions for user {UserId}",
            institutions.Count, userId);
        
        return institutions;
    }
    
    public async Task<bool> DeleteItemAsync(string userId, int itemId)
    {
        var item = await itemRepository.GetByIdAndUserIdAsync(itemId, userId);

        if (item == null)
        {
            logger.LogWarning("Unable to find item {ItemId} for user {UserId}",
                itemId, userId);
            return false;
        }
        
        logger.LogInformation("Retrieved item {ItemId} for user {UserId}", itemId, userId);

        var response = await plaidService.RemoveItemAsync(item.AccessToken);

        if (response.Error != null)
        {
            logger.LogWarning("Unable to remove the item {itemId} from Plaid for user {UserId}: {Error}",
                itemId, userId, response.Error);
            return false;
        }
        
        await itemRepository.DeleteAsync(item);
        logger.LogInformation("Deleted item {ItemId} for user {UserId}", itemId, userId);
            
        return true;
    }
    
    public async Task<ItemTokenExchangeResponse> ExchangePublicTokenAsync(string publicToken,
        string institutionName, string institutionId, string userId)
    {
        try
        {
            // Check if this institution is already linked for this user
            var items = await itemRepository.GetInstitutionsForUserAsync(userId);
            logger.LogInformation("Fetched {ItemCount} items for user {UserId}", items.Count, userId);
            
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
    
            var response = await plaidService.ExchangePublicTokenAsync(publicToken);
    
            if (response.Error != null)
            {
                logger.LogError("Error exchanging public token: {ErrorMessage}", response.Error.ErrorMessage);
                return ItemTokenExchangeResponse.Failure(response.Error);
            }
    
            await CreateItemAsync(response.AccessToken, userId, institutionName, response.ItemId, institutionId);
            logger.LogInformation("Created an item for user {UserId} with Plaid Id {PlaidItemId}",
                userId, response.ItemId);
    
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
        if (string.IsNullOrEmpty(webhookUrl))
        {
            logger.LogWarning("Plaid:WebhookUrl is empty");
        }
        
        try
        {
            var response = await plaidService.CreateLinkTokenAsync(userId, "ZenWealth");

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
            
            logger.LogInformation("Retrieved item {ItemId} for user {UserId}", itemId, userId);
            
            var webhookUrl = config["Plaid:WebhookUrl"];
            if (string.IsNullOrEmpty(webhookUrl))
            {
                logger.LogWarning("Plaid:WebhookUrl is empty");
            }
            
            var response = await plaidService.CreateUpdateLinkTokenAsync(userId, item.AccessToken, "ZenWealth");

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
        
        logger.LogInformation("Retrieved item {ItemId} using {PlaidItemId} for user {UserId}",
            item.Id, plaidItemId, item.UserId);
        
        await itemRepository.DeleteAsync(item);
        logger.LogInformation("Deleted item {ItemId} for user {UserId} for institution {InstitutionName}",
            item.Id, item.UserId, item.InstitutionName);
        
        return true;
    }
    
    private async Task CreateItemAsync(string accessToken, string userId,
        string institutionName, string itemId, string institutionId)
    {
        var item = new Entities_Item
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
    
        logger.LogInformation("Retrieved item {ItemId} for user {UserId}", itemId, userId);
        
        var hasMore = true;
    
        while (hasMore)
        {
            try
            {
                var data = await plaidService.SyncTransactionsAsync(item.AccessToken, item.Cursor);;
                logger.LogInformation("Fetched {AddedCount} added, {ModifiedCount} modified, " +
                                      "{RemovedCount} removed transactions for item {ItemId} and user {UserId}",
                    data.Added.Count, data.Modified.Count, data.Removed.Count, item.Id, userId
                );
                
                item.Cursor = string.IsNullOrEmpty(data.NextCursor) ? null : data.NextCursor;
                item.LastFetched = string.IsNullOrEmpty(item.Cursor) ? null : DateTime.Now;
                hasMore = data.HasMore;
                
                await itemRepository.UpdateAsync(item);
                logger.LogInformation("The item {ItemId} for user {UserId} has been updated with a new Cursor",
                    item.Id, userId);
    
                // Process accounts
                await ProcessAccountsAsync(data.Accounts, item.Id, userId);
                
                // Process added and modified transactions
                var addedCount = await ProcessTransactionsAsync(data.Added, userId);
                var modifiedCount = await ProcessTransactionsAsync(data.Modified, userId, true);
                
                // Process removed transactions
                await ProcessRemovedTransactionsAsync(data.Removed, userId);
                
                updatedCount += addedCount + modifiedCount;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing transactions for item {ItemId} and user {UserId}", 
                    item.Id, userId);
                throw;
            }
        }
    
        logger.LogInformation("Updated item {ItemId} for institution {InstitutionId} and user {UserId}", 
            item.Id, item.InstitutionId, userId);
        return updatedCount;
    }

    private async Task ProcessAccountsAsync(IReadOnlyList<PlaidAccount> accounts, int itemId, string userId)
    {
        if (accounts.Count == 0)
        {
            logger.LogWarning("No Accounts to add for item {ItemId} for user {UserId}", itemId, userId);
            return;
        }

        // Get all existing account IDs in one query
        var existingAccountIds = await accountRepository.GetExistingAccountIdsAsync(itemId);
        logger.LogInformation("Retrieved {AccountCount} account IDs for item {ItemId} for user {UserId}",
            accounts.Count, itemId, userId);

        var newAccounts = new List<Entities_Account>();
    
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

            newAccounts.Add(new Entities_Account
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
            await accountRepository.AddRangeAsync(newAccounts);
            logger.LogInformation("Added {AccountCount} new accounts for item {ItemId} and user {UserId}",
                newAccounts.Count, itemId, userId);
        }
    }

    private async Task<int> ProcessTransactionsAsync(IReadOnlyList<PlaidTransaction> transactions, string userId, bool isModified = false)
    {
        if (transactions.Count == 0)
        {
            if (isModified)
                logger.LogInformation("No transactions to modify for user {UserId}", userId);
            else
                logger.LogInformation("No transactions to add for user {UserId}", userId);
            return 0;
        }
    
        var sortedTransactions = transactions.OrderBy(t => t.Date).ToList();
        
        // Get all transaction IDs in one query
        var transactionIds = sortedTransactions
            .Select(t => t.TransactionId)
            .Where(id => id != null)
            .ToList();
        
        var existingTransactionIds = await transactionRepository.GetExistingTransactionIdsAsync(transactionIds);
        logger.LogInformation("Retrieved {TransactionCount} transactions IDs for user {UserId}",
            existingTransactionIds.Count, userId);
    
        // Get account mapping in one query
        var accountIds = sortedTransactions
            .Select(t => t.AccountId)
            .Distinct()
            .ToList();
        
        var accountMapping = await accountRepository.GetAccountMappingAsync(accountIds);
        logger.LogInformation("Retrieved a dictionary containing {AccountCount} accounts for user {UserId}",
            accountMapping.Keys.Count, userId);
    
        var newTransactions = new List<Entities_Transaction>();
        var modifiedTransactions = new List<Entities_Transaction>();
        
        foreach (var transaction in sortedTransactions)
        {
            if (transaction.TransactionId == null)
            {
                logger.LogWarning(
                    "Skipping transaction with null ID for user {UserId}",
                    userId
                );
                continue;
            }
    
            if (!accountMapping.TryGetValue(transaction.AccountId ?? string.Empty, out var accountId))
            {
                logger.LogWarning(
                    "Skipping transaction {PlaidTransactionId} for user {UserId} as the account does not exist",
                    transaction.TransactionId, userId
                );
                continue;
            }
    
            var newTransaction = new Entities_Transaction
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
            };
    
            if (isModified && existingTransactionIds.Contains(transaction.TransactionId))
            {
                modifiedTransactions.Add(newTransaction);
            }
            else if (!isModified && !existingTransactionIds.Contains(transaction.TransactionId))
            {
                newTransactions.Add(newTransaction);
            }
            else
            {
                logger.LogWarning(
                    "Skipping transaction {PlaidTransactionId} for user {UserId} as it doesn't match the expected state (exists: {Exists}, isModified: {IsModified})",
                    transaction.TransactionId, userId, existingTransactionIds.Contains(transaction.TransactionId), isModified
                );
            }
        }
    
        var count = 0;
        
        // Handle new transactions
        if (newTransactions.Count > 0)
        {
            await transactionRepository.AddRangeAsync(newTransactions);
            logger.LogInformation("Added {TransactionCount} new transactions for user {UserId}",
                newTransactions.Count, userId);
            count += newTransactions.Count;
        }
        
        // Handle modified transactions
        if (modifiedTransactions.Count > 0)
        {
            await transactionRepository.UpdateRangeAsync(modifiedTransactions);
            logger.LogInformation("Updated {TransactionCount} existing transactions for user {UserId}",
                modifiedTransactions.Count, userId);
            count += modifiedTransactions.Count;
        }
    
        return count;
    }
    private async Task ProcessRemovedTransactionsAsync(IReadOnlyList<RemovedTransaction> removedTransactions, string userId)
    {
        if (removedTransactions.Count == 0)
        {
            logger.LogInformation("No transactions to remove for user {UserId}", userId);
            return;
        }
    
        var transactionIds = removedTransactions
            .Select(t => t.TransactionId)
            .ToList();
    
        if (transactionIds.Count == 0)
        {
            return;
        }
    
        var removedCount = await transactionRepository.RemoveByPlaidIdsAsync(transactionIds);
    
        logger.LogInformation("Removed {TransactionCount} transactions for user {UserId}",
            removedCount, userId);
    }
    
    private static bool ShouldSkipItemUpdate(Entities_Item item)
    {
        var skip = item.LastFetched != null && DateTime.Now.AddDays(-1) < item.LastFetched;
        return skip;
    }
}