using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Data.DTOs;
using Account = Server.Data.Models.Account;
using Item = Server.Data.Models.Item;
using Transaction = Server.Data.Models.Transaction;

namespace Server.Services;

public class ItemsService(
    AppDbContext context,
    ILogger<ItemsService> logger,
    PlaidClient client,
    IConfiguration config
) : IItemsService
{
    public async Task<bool> CheckItemExistsAsync(string userId)
    {
        var result = await context.Items.AnyAsync(i => i.UserId == userId);
        logger.LogInformation("Checked if user {UserId} has an item", userId);
        
        return result;
    }

    public async Task<IEnumerable<InstitutionDto>> GetItemsAsync(string userId)
    {
        var items = await context.Items
            .Where(i => i.UserId == userId)
            .Select(i => new InstitutionDto
            {
                Id = i.Id,
                Name = i.InstitutionName,
            })
            .ToListAsync();
        
        return items;
    }
    
    public async Task<int> UpdateItemsAsync(string userId)
    {
        var updatedCount = 0;
        var items = await context.Items
            .Where(i => i.UserId == userId)
            .AsNoTracking()
            .ToListAsync();

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
    
    public async Task<int> UpdateItemByIdAsync(string plaidItemId)
    {
        var item = await context.Items.FirstOrDefaultAsync(i => i.PlaidItemId == plaidItemId);

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
    
    public async Task<bool> DeleteItemAsync(string userId, int itemId)
    {
        var item = await context.Items.SingleOrDefaultAsync(i => i.Id == itemId && i.UserId == userId);

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
        
        context.Items.Remove(item);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Deleted item {ItemId} for user {UserId}", itemId, userId);
            
        return true;
    }
    
    public async Task<ItemTokenExchangeResult> ExchangePublicTokenAsync(string publicToken, string institutionName, string userId)
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
                return ItemTokenExchangeResult.Failure(response.Error);
            }

            await CreateItemAsync(response.AccessToken, userId, institutionName, response.ItemId);

            // Wait briefly before updating items to ensure the item is created
            await Task.Delay(1000);

            var addedTransactions = await UpdateItemsAsync(userId);
            
            logger.LogInformation("Successfully exchanged public token for user {UserId} with {AddedTransactions} transactions", 
                userId, addedTransactions);
                
            return ItemTokenExchangeResult.Success(addedTransactions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while exchanging public token for user {UserId}", userId);
            return ItemTokenExchangeResult.Failure(new PlaidError
            {
                ErrorType = "API_ERROR",
                ErrorCode = "INTERNAL_SERVER_ERROR",
                ErrorMessage = "An unexpected error occurred while processing your request."
            });
        }
    }
    
    public async Task<LinkTokenResult> CreateLinkTokenAsync(string userId)
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
                Webhook = webhookUrl
            });

            if (response.Error != null)
            {
                logger.LogError("Error creating link token: {ErrorType} - {ErrorCode}: {ErrorMessage}",
                    response.Error.ErrorType, response.Error.ErrorCode, response.Error.ErrorMessage);
                
                return LinkTokenResult.Failure(
                    $"Unable to create link token: {response.Error.ErrorMessage}", 
                    response.Error);
            }

            logger.LogInformation("Successfully created link token for user {UserId}", userId);
            return LinkTokenResult.Success(response.LinkToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while creating link token for user {UserId}", userId);
            return LinkTokenResult.Failure("An unexpected error occurred while creating the link token");
        }
    }
    
    private async Task CreateItemAsync(string accessToken, string userId, string institutionName, string itemId)
    {
        context.Items.Add(new Item()
        {
            AccessToken = accessToken,
            UserId = userId,
            InstitutionName = institutionName,
            PlaidItemId = itemId
        });
        
        await context.SaveChangesAsync();
        logger.LogInformation("Added item for user {UserId}", userId);
    }

     public async Task<LinkTokenResult> CreateUpdateLinkTokenAsync(string userId, int itemId)
    {
        try
        {
            // Find the item and ensure it belongs to the user
            var item = await context.Items
                .FirstOrDefaultAsync(i => i.Id == itemId && i.UserId == userId);
                
            if (item == null)
            {
                logger.LogWarning("Item {ItemId} not found for user {UserId}", itemId, userId);
                return LinkTokenResult.Failure($"Item with ID {itemId} not found");
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
                Webhook = webhookUrl
            });

            if (response.Error != null)
            {
                logger.LogError("Error creating update link token: {ErrorType} - {ErrorCode}: {ErrorMessage}",
                    response.Error.ErrorType, response.Error.ErrorCode, response.Error.ErrorMessage);
                
                return LinkTokenResult.Failure(
                    $"Unable to create update link token: {response.Error.ErrorMessage}", 
                    response.Error);
            }

            logger.LogInformation("Successfully created update link token for user {UserId} and item {ItemId}", 
                userId, itemId);
            return LinkTokenResult.Success(response.LinkToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception while creating update link token for user {UserId} and item {ItemId}", 
                userId, itemId);
            return LinkTokenResult.Failure("An unexpected error occurred while creating the update link token");
        }
    }

    // Core update method that both public methods will use
    private async Task<int> UpdateSingleItemAsync(int itemId, string userId)
    {
        var updatedCount = 0;
        var item = await context.Items
            .FirstOrDefaultAsync(i => i.Id == itemId && i.UserId == userId);

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
            // Using a transaction to ensure data consistency
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
                await context.SaveChangesAsync();

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
        var existingAccountIds = (await context.Accounts
                .Where(a => a.ItemId == itemId)
                .Select(a => a.PlaidAccountId)
                .ToListAsync())
            .ToHashSet();

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
            // Replace bulk insert with standard AddRange and SaveChanges
            context.Accounts.AddRange(newAccounts);
            await context.SaveChangesAsync();
        
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
    
    var existingTransactionIds = (await context.Transactions
        .Where(t => transactionIds.Contains(t.PlaidTransactionId))
        .Select(t => t.PlaidTransactionId)
        .ToListAsync())
        .ToHashSet();

    // Get account mapping in one query
    var accountIds = sortedTransactions
        .Select(t => t.AccountId)
        .Distinct()
        .ToList();
    
    var accountMapping = await context.Accounts
        .Where(a => accountIds.Contains(a.PlaidAccountId))
        .Select(a => new { a.PlaidAccountId, a.Id })
        .ToDictionaryAsync(a => a.PlaidAccountId, a => a.Id);

    var newTransactions = new List<Transaction>();
    
    foreach (var transaction in sortedTransactions)
    {
        if (transaction.TransactionId == null || existingTransactionIds.Contains(transaction.TransactionId))
        {
            continue;
        }

        if (!accountMapping.TryGetValue(transaction.AccountId, out var accountId))
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

    if (newTransactions.Count > 0)
    {
        // Replace bulk insert with standard AddRange and SaveChanges
        context.Transactions.AddRange(newTransactions);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Added {TransactionCount} new transactions for user {UserId}",
            newTransactions.Count, userId);
    }

    return newTransactions.Count;
}
    
    private static bool ShouldSkipItemUpdate(Item item)
    {
        return item.LastFetched != null && DateTime.Now.AddDays(-1) < item.LastFetched;
    }
}