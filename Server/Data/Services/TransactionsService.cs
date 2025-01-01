using Going.Plaid;
using Going.Plaid.Transactions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Utils;

namespace Server.Data.Services;

public class TransactionsService(
    AppDbContext context,
    PlaidClient client
    ) : ITransactionsService
{
    public async Task Sync(IdentityUser user)
    {
        var items = context.Items
            .Include(i => i.User)
            .Where(i => i.User == user)
            .ToList();

        foreach (var i in items)
        {
            if (i.LastFetched != null & DateTime.Now.AddDays(-1) < i.LastFetched)
            {
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
                
                // Console.WriteLine($"Current Cursor value is {i.Cursor}");

                foreach (var account in transactions.Accounts)
                {
                    if (context.Accounts.Any(a => a.Id == account.AccountId))
                    {
                        continue;
                    }

                    context.Accounts.Add(new Account()
                    {
                        Id = account.AccountId,
                        ItemId = i.Id,
                        User = user,
                        Name = account.Name,
                        Type = account.Type.ToString(),
                        Balance = account.Balances.Current == null ? 0.00 : (double)account.Balances.Current,
                        Mask = account.Mask,
                        Subtype = account.Subtype.ToString(),
                        OfficialName = account.OfficialName,
                    });

                    await context.SaveChangesAsync();
                }

                foreach (var transaction in transactions.Added)
                {
                    if (context.Transactions.Any(t => t.Id == transaction.TransactionId))
                    {
                        continue;
                    }

                    context.Transactions.Add(new Transaction()
                    {
                        Id = transaction.TransactionId!,
                        AccountId = transaction.AccountId!,
                        User = user,
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
                        IsoCurrencyCode = transaction.IsoCurrencyCode,
                        PersonalFinanceCategory = transaction.PersonalFinanceCategory!.Primary,
                        UnofficialCurrencyCode = transaction.UnofficialCurrencyCode,
                        PersonalFinanceCategoryIconUrl = transaction.PersonalFinanceCategoryIconUrl,
                    });

                    await context.SaveChangesAsync();
                }

                i.Cursor = transactions.NextCursor;
                i.LastFetched = DateTime.Now;

                await context.SaveChangesAsync();
                
                if (!transactions.HasMore)
                {
                    hasMore = false;
                }
            }
        }
        
    }

    public List<StrippedTransaction> GetAll(IdentityUser user)
    {
        var transactions = context.Transactions
            .Where(t => t.User == user)
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
            .ToList();

        return transactions;
    }
}