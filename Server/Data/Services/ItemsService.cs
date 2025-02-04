using Going.Plaid;
using Going.Plaid.Transactions;
using Microsoft.EntityFrameworkCore;
using Server.Data.Models;

namespace Server.Data.Services;

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
    public async Task CreateItemAsync(string accessToken, string userId, string institutionName)
    {
        await context.Items.AddAsync(new Item()
        {
            AccessToken = accessToken,
            UserId = userId,
            InstitutionName = institutionName
        });
        
        await context.SaveChangesAsync();
        
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
    public async Task UpdateItemsAsync(string userId)
    {
        var user = await context.Users
            .Include(u => u.Items)
            .Include(u => u.Accounts)
            .Include(u => u.Transactions)
            .SingleAsync(u => u.Id == userId);

        logger.LogInformation("User {UserId} found for Item updating", userId);

        var items = user.Items.ToList();

        foreach (var item in items)
        {
            if (item.LastFetched != null && DateTime.Now.AddDays(-1) < item.LastFetched)
            {
                logger.LogInformation("Skipping item {ItemId} for user {UserId} as it was recently fetched", item.Id, userId);
                continue;
            }

            var hasMore = true;

            while (hasMore)
            {
                var transactions = await client.TransactionsSyncAsync(new TransactionsSyncRequest()
                {
                    AccessToken = item.AccessToken,
                    Count = 500,
                    Cursor = item.Cursor == null ? "" : item.Cursor
                });
                
                item.Cursor = transactions.NextCursor == "" ? null : transactions.NextCursor;
                item.LastFetched =  item.Cursor == null ? null : DateTime.Now;
                item.TransactionCount += transactions.Added.Count; 
                await context.SaveChangesAsync();

                logger.LogInformation("Fetched {TransactionCount} transactions for item {ItemId} and user {UserId}",
                    transactions.Added.Count, item.Id, userId
                );

                foreach (var account in transactions.Accounts)
                {
                    if (context.Accounts.Any(a => a.AccountId == account.AccountId))
                    {
                        logger.LogInformation(
                            "Skipping account {AccountId} for item {ItemId} and user {UserId} as it already exists",
                            account.AccountId, item.Id, userId);
                        continue;
                    }

                    await context.Accounts.AddAsync(new Account()
                    {
                        AccountId = account.AccountId,
                        ItemId = item.Id,
                        UserId = user.Id,
                        Name = account.Name,
                        Type = account.Type.ToString(),
                        CurrentBalance = (double?)account.Balances.Current ?? 0.00,
                        AvailableBalance = (double?)account.Balances.Available ?? 0.00,
                        Mask = account.Mask,
                        Subtype = account.Subtype.ToString(),
                        OfficialName = account.OfficialName,
                    });

                    logger.LogInformation("Added account {AccountId} for item {ItemId} and user {UserId}",
                        account.AccountId, item.Id, userId);

                    await context.SaveChangesAsync();
                }

                var sortedTransactions = transactions.Added.OrderBy(t => t.Date);

                foreach (var transaction in sortedTransactions)
                {
                    if (context.Transactions.Any(t => t.TransactionId == transaction.TransactionId))
                    {
                        logger.LogInformation(
                            "Skipping transaction {TransactionId} for item {ItemId} and user {UserId} as it already exists",
                            transaction.TransactionId, item.Id, userId);
                        continue;
                    }

                    var account = await context.Accounts.SingleOrDefaultAsync(a => a.AccountId == transaction.AccountId);

                    if (account == null)
                    {
                        logger.LogInformation(
                            "Skipping transaction {TransactionId} for item {ItemId} and user {UserId} as the account does not exist",
                            transaction.TransactionId, item.Id, userId
                        );
                        
                        continue;
                    }

                    await context.Transactions.AddAsync(new Transaction()
                    {
                        TransactionId = transaction.TransactionId!,
                        AccountId = account.Id,
                        UserId = user.Id,
                        Name = transaction.Name,
                        Amount = transaction.Amount == null ? 0.00 : (double)transaction.Amount,
                        Date = transaction.Date ?? new DateOnly(),
                        Datetime = transaction.Datetime,
                        Website = transaction.Website,
                        PersonalFinanceCategory = transaction.PersonalFinanceCategory?.Primary,
                        PersonalFinanceCategoryIconUrl = transaction.PersonalFinanceCategoryIconUrl,
                        IsoCurrencyCode = transaction.IsoCurrencyCode ?? transaction.UnofficialCurrencyCode,
                        LogoUrl = transaction.LogoUrl,
                        MerchantName = transaction.MerchantName,
                        PaymentChannel = transaction.PaymentChannel.ToString(),
                        TransactionCode = transaction.TransactionCode == null
                            ? null
                            : transaction.TransactionCode.ToString(),
                    });

                    logger.LogInformation("Added transaction {TransactionId} for item {ItemId} and user {UserId}",
                        transaction.TransactionId, item.Id, userId);

                    await context.SaveChangesAsync();
                }

                hasMore = transactions.HasMore;
            }
        }
    }
}