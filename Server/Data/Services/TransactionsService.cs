using Going.Plaid;
using Going.Plaid.Transactions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Models;

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
            var transactions = await client.TransactionsSyncAsync(new TransactionsSyncRequest()
            {
                AccessToken = i.AccessToken,
                Count = 500,
            });    
            
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
                    TransactionCode = transaction.TransactionCode == null ? null : transaction.TransactionCode.ToString(),
                    IsoCurrencyCode = transaction.IsoCurrencyCode,
                    PersonalFinanceCategory = transaction.PersonalFinanceCategory!.Primary,
                    UnofficialCurrencyCode = transaction.UnofficialCurrencyCode,
                    PersonalFinanceCategoryIconUrl = transaction.PersonalFinanceCategoryIconUrl,
                });
            
                await context.SaveChangesAsync();
            }
        }
        
    }

    public List<Transaction> GetAll(IdentityUser user)
    {
        var transactions = context.Transactions
            .Where(t => t.User == user)
            .ToList();

        return transactions;
    }
}