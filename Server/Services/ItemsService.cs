using EFCore.BulkExtensions;
using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Microsoft.EntityFrameworkCore;
using Server.Data;
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
    /// <summary>
    /// Adds a new item to the database for the given user.
    /// </summary>
    /// <param name="accessToken">The access token for the item.</param>
    /// <param name="userId">The user ID of the user that the item belongs to.</param>
    /// <param name="institutionName">The institution name</param>
    public void CreateItem(string accessToken, string userId, string institutionName)
    {
        context.Items.Add(new Item()
        {
            AccessToken = accessToken,
            UserId = userId,
            InstitutionName = institutionName
        });
        
        context.SaveChanges();
        logger.LogInformation("Added item for user {UserId}", userId);
    }
    
    /// <summary>
    /// Checks if a user has an item.
    /// </summary>
    /// <param name="userId">The ID of the user to check.</param>
    /// <returns>True if the user has an item, false otherwise.</returns>
    public async Task<bool> CheckItemExistsAsync(string userId)
    {
        var result = await context.Items.AnyAsync(i => i.UserId == userId);
        logger.LogInformation("Checked if user {UserId} has an item", userId);
        
        return result;
    }
    
    /// <summary>
    /// Asynchronously adds all new transactions for a specified user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user for whom transactions are to be synchronized.</param>
    /// <remarks>
    /// If the user has any items, this method will fetch transactions for each item and add them to the user's account.
    /// If an item was recently fetched, it will be skipped.
    /// It fetches updates using a cursor to track which updates have already been seen.
    /// </remarks>
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

    /// <summary>
    /// Deletes an item for a user.
    /// </summary>
    /// <param name="userId">The user ID of the user that the item belongs to.</param>
    /// <param name="itemId">The ID of the item to delete.</param>
    /// <returns>True if the item was deleted, false otherwise.</returns>
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
            return false;
        }
        
        context.Items.Remove(item);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Deleted item {ItemId} for user {UserId}", itemId, userId);
            
        return true;
    }
    
    /// <summary>
    /// Exchanges a public token for an access token and creates a new item for the user
    /// </summary>
    /// <param name="publicToken">The public token to exchange</param>
    /// <param name="institutionName">The name of the institution</param>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A result containing success status, any errors, and number of added transactions</returns>
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

            CreateItem(response.AccessToken, userId, institutionName);

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
    
    /// <summary>
    /// Creates a link token for the given user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A result containing success status, link token, and any errors</returns>
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