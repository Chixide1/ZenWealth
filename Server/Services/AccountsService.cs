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
    
    public async Task<int> UpdateAccountsByPlaidItemIdAsync(string plaidItemId)
    {
        // Find the item in the database
        var item = await context.Items
            .FirstOrDefaultAsync(i => i.PlaidItemId == plaidItemId);

        if (item == null)
        {
            logger.LogWarning("Item with Plaid ID {PlaidItemId} not found", plaidItemId);
            return 0;
        }

        logger.LogInformation("Updating accounts for item {ItemId} (Plaid ID: {PlaidItemId}) for user {UserId}",
            item.Id, plaidItemId, item.UserId);

        try
        {
            // Update accounts for the specific item
            int processedCount = await ProcessAccountsForItemAsync(item);
            return processedCount;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating accounts for item {ItemId} (Plaid ID: {PlaidItemId})", 
                item.Id, plaidItemId);
            throw; // Re-throw to allow caller to handle the exception
        }
    }
    
    public async Task UpdateAccountsAsync(string userId)
    {
        logger.LogInformation("Starting account update for user {UserId}", userId);

        var items = await context.Items
            .Where(i => i.UserId == userId && i.LastFetched != null && DateTime.Now.AddDays(-1) < i.LastFetched)
            .ToListAsync();

        int totalProcessed = 0;
        foreach (var item in items)
        {
            try
            {
                totalProcessed += await ProcessAccountsForItemAsync(item);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing accounts for item {ItemId} for user {UserId}", 
                    item.Id, userId);
            }
        }

        logger.LogInformation("Completed account update for user {UserId}, processed {Count} accounts", 
            userId, totalProcessed);
    }

    private async Task<int> ProcessAccountsForItemAsync(Item item)
    {
        // Get existing accounts to check which ones need to be updated vs. created
        var existingAccounts = await context.Accounts
            .Where(a => a.ItemId == item.Id)
            .ToDictionaryAsync(a => a.PlaidAccountId, a => a);

        // Get latest account data from Plaid
        var data = await client.AccountsGetAsync(new AccountsGetRequest
        {
            AccessToken = item.AccessToken
        });

        int updatedCount = 0;
        int addedCount = 0;

        foreach (var account in data.Accounts)
        {
            if (existingAccounts.TryGetValue(account.AccountId, out var entity))
            {
                // Update existing account
                var currentBalance = account.Balances.Current;
                
                if (currentBalance != null)
                {
                    entity.CurrentBalance = (decimal)currentBalance;
                    entity.AvailableBalance = account.Balances.Available ?? entity.AvailableBalance;
                    
                    logger.LogInformation(
                        "Updated account {PlaidAccountId} (balance: {Balance}) for item {ItemId}",
                        account.AccountId, currentBalance, item.Id
                    );
                    
                    updatedCount++;
                }
                else
                {
                    logger.LogWarning(
                        "Unable to update account {PlaidAccountId} for user {UserId} of item {ItemId} - missing balance data",
                        account.AccountId, item.UserId, item.Id
                    );
                }
            }
            else
            {
                // Add new account
                context.Accounts.Add(new Account
                {
                    PlaidAccountId = account.AccountId,
                    ItemId = item.Id,
                    UserId = item.UserId,
                    Name = account.Name,
                    Type = account.Type.ToString(),
                    CurrentBalance = account.Balances.Current ?? 0,
                    AvailableBalance = account.Balances.Available ?? 0,
                    Mask = account.Mask,
                    Subtype = account.Subtype.ToString(),
                    OfficialName = account.OfficialName,
                });
                
                logger.LogInformation(
                    "Added new account {PlaidAccountId} for user {UserId} of item {ItemId}",
                    account.AccountId, item.UserId, item.Id
                );
                
                addedCount++;
            }
        }

        // Persist changes to database
        await context.SaveChangesAsync();
        
        logger.LogInformation(
            "Successfully processed accounts for item {ItemId}: {UpdatedCount} updated, {AddedCount} added",
            item.Id, updatedCount, addedCount
        );
        
        return updatedCount + addedCount;
    }
}