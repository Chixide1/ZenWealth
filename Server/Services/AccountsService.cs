using Going.Plaid;
using Going.Plaid.Accounts;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Data.DTOs;
using Server.Data.Models;

namespace Server.Services;

public class AccountsService(
    ILogger<AccountsService> logger,
    PlaidClient client,
    AppDbContext context) : IAccountsService
{
    /// <summary>
    /// Asynchronously retrieves all accounts for a specified user and returns them as a list of account DTOs.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose accounts are to be retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing a list of account DTOs for the user.</returns>
    public async Task<List<AccountDto>> GetAccountsAsync(string userId)
    {
        var accounts = await context.Accounts
            .Where(a => a.UserId == userId && a.Type != "Loan")
            .Select(a => new AccountDto()
            {
                Id = a.Id,
                CurrentBalance = a.CurrentBalance,
                AvailableBalance = a.AvailableBalance,
                Name = a.Name,
                OfficialName = a.OfficialName ?? "",
                Mask = a.Mask ?? "",
                Subtype = a.Subtype ?? "",
                Type = a.Type
            })
            .ToListAsync();

        logger.LogInformation("Retrieved {AccountCount} accounts for user {UserId}", accounts.Count, userId);

        return accounts;
    }

    /// <summary>
    /// Asynchronously updates the accounts for a specified user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose accounts are to be updated.</param>
    /// <remarks>
    /// This method retrieves items associated with the user that were fetched within the last day.
    /// For each item, it fetches account data using the Plaid API. If an account already exists in the database,
    /// its current balance is updated. Otherwise, a new account is added to the database.
    /// </remarks>
    public async Task UpdateAccountsAsync(string userId)
    {
        logger.LogInformation("Starting account update for user {UserId}", userId);

        var items = await context.Items
            .Where(i => i.UserId == userId && i.LastFetched != null && DateTime.Now.AddDays(-1) < i.LastFetched)
            .ToListAsync();

        var existingAccounts = await context.Accounts
            .Where(a => a.UserId == userId)
            .ToDictionaryAsync(a => a.PlaidAccountId, a => a);

        foreach (var item in items)
        {
            var data = await client.AccountsGetAsync(new AccountsGetRequest()
            {
                AccessToken = item.AccessToken
            });

            foreach (var account in data.Accounts)
            {
                if (existingAccounts.TryGetValue(account.AccountId, out var entity))
                {
                    entity.CurrentBalance = (double?)account.Balances.Current ?? 0.00;

                    logger.LogInformation(
                        "Updated account {PlaidAccountId} for user {UserId} of item {ItemId}",
                        account.AccountId, userId, item.Id
                    );
                }
                else
                {
                    context.Accounts.Add(new Account()
                    {
                        PlaidAccountId = account.AccountId,
                        ItemId = item.Id,
                        UserId = item.UserId,
                        Name = account.Name,
                        Type = account.Type.ToString(),
                        CurrentBalance = (double?)account.Balances.Current ?? 0.00,
                        AvailableBalance = (double?)account.Balances.Available ?? 0.00,
                        Mask = account.Mask,
                        Subtype = account.Subtype.ToString(),
                        OfficialName = account.OfficialName,
                    });
                    
                    logger.LogInformation("Added account {PlaidAccountId} for user {UserId} of item {ItemId}", account.AccountId, userId, item.Id);
                }
            }
        }

        await context.SaveChangesAsync();
    }
}