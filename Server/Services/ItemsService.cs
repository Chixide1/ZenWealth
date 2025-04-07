using EFCore.BulkExtensions;
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

/// <summary>
/// The Service where the business logic for Items is implemented.
/// Also used as the Data Access Layer.
/// </summary>
public class ItemsService(
    AppDbContext context,
    ILogger<ItemsService> logger,
    PlaidClient client
) : IItemsService
{
    public async Task CreateItemAsync(string accessToken, string userId, string institutionName)
    {
        context.Items.Add(new Item()
        {
            AccessToken = accessToken,
            UserId = userId,
            InstitutionName = institutionName
        });
        
        await context.SaveChangesAsync();
        logger.LogInformation("Added item for user {UserId}", userId);
    }
    
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
        var items = context.Items.Where(i => i.UserId == userId).ToList();

        foreach (var item in items)
        {
            logger.LogInformation("updating item {item} for institution {institution} and user {user}", item.Id, item.InstitutionName, userId);
            
            if (item.LastFetched != null && DateTime.Now.AddDays(-1) < item.LastFetched)
            {
                logger.LogInformation("Skipping item {ItemId} for user {UserId} as it was recently fetched", item.Id, userId);
                continue;
            }

            var hasMore = true;

            while (hasMore)
            {
                var request = new TransactionsSyncRequest()
                {
                    AccessToken = item.AccessToken,
                    Cursor = item.Cursor
                };
                
                var data = await client.TransactionsSyncAsync(request);
                
                item.Cursor = string.IsNullOrEmpty(data.NextCursor) ? null : data.NextCursor;
                item.LastFetched =  string.IsNullOrEmpty(item.Cursor) ? null : DateTime.Now;
                hasMore = data.HasMore;
                await context.SaveChangesAsync();

                logger.LogInformation("Fetched {TransactionCount} transactions for item {ItemId} and user {UserId}",
                    data.Added.Count, item.Id, userId
                );

                var accounts = new List<Account>();
                
                foreach (var account in data.Accounts)
                {
                    if (context.Accounts.Any(a => a.PlaidAccountId == account.AccountId))
                    {
                        logger.LogInformation(
                            "Skipping account {PlaidAccountId} for item {ItemId} and user {UserId} as it already exists",
                            account.AccountId, item.Id, userId
                        );
                        continue;
                    }

                    accounts.Add(new Account
                    {
                        PlaidAccountId = account.AccountId,
                        ItemId = item.Id,
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
                
                await context.BulkInsertOrUpdateAsync(accounts);
                
                var sortedTransactions = data.Added.OrderBy(t => t.Date);
                var transactions = new List<Transaction>();
                
                foreach (var transaction in sortedTransactions)
                {
                    if (context.Transactions.Any(t => t.PlaidTransactionId == transaction.TransactionId))
                    {
                        logger.LogInformation(
                            "Skipping transaction {PlaidTransactionId} for item {ItemId} and user {UserId} as it already exists",
                            transaction.TransactionId, item.Id, userId
                        );
                        continue;
                    }

                    var account = await context.Accounts.FirstOrDefaultAsync(a => a.PlaidAccountId == transaction.AccountId);

                    if (account == null)
                    {
                        logger.LogInformation(
                            "Skipping transaction {PlaidTransactionId} for item {ItemId} and user {UserId} as the account does not exist",
                            transaction.TransactionId, item.Id, userId
                        );
                        
                        continue;
                    }

                    transactions.Add(new Transaction()
                    {
                        PlaidTransactionId = transaction.TransactionId!,
                        AccountId = account.Id,
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

                await context.BulkInsertOrUpdateAsync(transactions);
                updatedCount += transactions.Count;
            }
        }

        return updatedCount;
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

            await CreateItemAsync(response.AccessToken, userId, institutionName);

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
                CountryCodes = [CountryCode.Gb]
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
}