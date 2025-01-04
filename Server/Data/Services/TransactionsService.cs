using Going.Plaid;
using Going.Plaid.Transactions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Common;
using Server.Data.Models;

namespace Server.Data.Services;

public class TransactionsService(
    AppDbContext context,
    PlaidClient client,
    ILogger<TransactionsService> logger
) : ITransactionsService
{
    public async Task SyncAsync(string userId)
    {
        var user = await context.Users
            .Include(u => u.Items)
            .Include(u => u.Accounts)
            .Include(u => u.Transactions)
            .SingleAsync(u => u.Id == userId);

        logger.LogInformation("User {UserId} found", userId);

        var items = user.Items.ToList();

        foreach (var i in items)
        {
            if (i.LastFetched != null & DateTime.Now.AddDays(-1) < i.LastFetched)
            {
                logger.LogInformation("Skipping item {ItemId} for user {UserId} as it was recently fetched", i.Id,
                    userId);
                continue;
            }

            var hasMore = true;

            while (hasMore)
            {
                var transactions = await client.TransactionsSyncAsync(new TransactionsSyncRequest()
                {
                    AccessToken = i.AccessToken,
                    Count = 500,
                    Cursor = i.Cursor
                });

                logger.LogInformation("Fetched {TransactionCount} transactions for item {ItemId} and user {UserId}",
                    transactions.Added.Count, i.Id, userId);

                foreach (var account in transactions.Accounts)
                {
                    if (context.Accounts.Any(a => a.Id == account.AccountId))
                    {
                        logger.LogInformation(
                            "Skipping account {AccountId} for item {ItemId} and user {UserId} as it already exists",
                            account.AccountId, i.Id, userId);
                        continue;
                    }

                    await context.Accounts.AddAsync(new Account()
                    {
                        Id = account.AccountId,
                        ItemId = i.Id,
                        UserId = user.Id,
                        Name = account.Name,
                        Type = account.Type.ToString(),
                        Balance = account.Balances.Current == null ? 0.00 : (double)account.Balances.Current,
                        Mask = account.Mask,
                        Subtype = account.Subtype.ToString(),
                        OfficialName = account.OfficialName,
                    });

                    logger.LogInformation("Added account {AccountId} for item {ItemId} and user {UserId}",
                        account.AccountId, i.Id, userId);

                    await context.SaveChangesAsync();
                }

                foreach (var transaction in transactions.Added)
                {
                    if (context.Transactions.Any(t => t.Id == transaction.TransactionId))
                    {
                        logger.LogInformation(
                            "Skipping transaction {TransactionId} for item {ItemId} and user {UserId} as it already exists",
                            transaction.TransactionId, i.Id, userId);
                        continue;
                    }

                    await context.Transactions.AddAsync(new Transaction()
                    {
                        Id = transaction.TransactionId!,
                        AccountId = transaction.AccountId!,
                        UserId = user.Id,
                        Name = transaction.Name,
                        Amount = transaction.Amount == null ? 0.00 : (double)transaction.Amount,
                        Date = transaction.Date,
                        Datetime = transaction.Datetime,
                        Website = transaction.Website,
                        LogoUrl = transaction.LogoUrl,
                        MerchantName = transaction.MerchantName,
                        PaymentChannel = transaction.PaymentChannel.ToString(),
                        TransactionCode = transaction.TransactionCode == null
                            ? null
                            : transaction.TransactionCode.ToString(),
                    });

                    logger.LogInformation("Added transaction {TransactionId} for item {ItemId} and user {UserId}",
                        transaction.TransactionId, i.Id, userId);

                    await context.SaveChangesAsync();
                }

                hasMore = transactions.HasMore;
            }
        }
    }

    public async Task<List<StrippedTransaction>> GetAllAsync(string userId)
    {
        var transactions = await context.Transactions
            .Where(t => t.UserId == userId)
            .Select(t => new StrippedTransaction()
            {
                Id = t.Id,
                Name = t.Name,
                PaymentChannel = t.PaymentChannel,
                AccountId = t.AccountId,
                Amount = t.Amount,
                Date = t.Date,
                Datetime = t.Datetime,
                IsoCurrencyCode = t.IsoCurrencyCode,
                UnofficialCurrencyCode = t.UnofficialCurrencyCode,
                PersonalFinanceCategory = t.PersonalFinanceCategory,
                MerchantName = t.MerchantName,
                LogoUrl = t.LogoUrl,
                PersonalFinanceCategoryIconUrl = t.PersonalFinanceCategoryIconUrl,
                TransactionCode = t.TransactionCode
            })
            .ToListAsync();

        logger.LogInformation("Retrieved {TransactionCount} transactions for user {UserId}", transactions.Count,
            userId);

        return transactions;
    }
}