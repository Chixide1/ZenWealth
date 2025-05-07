using Core.Application.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Interfaces;
using Core.Models;
using Going.Plaid;
using Going.Plaid.Accounts;
using Microsoft.Extensions.Logging;

namespace Core.Application.Services;

internal class AccountsService(
    ILogger<AccountsService> logger,
    PlaidClient client,
    IAccountRepository accountRepository,
    IItemRepository itemRepository) : IAccountsService
{
    public async Task<List<AccountDto>> GetAccountsAsync(string userId)
    {
        var accounts = await accountRepository.GetAccountsByUserIdAsync(userId);
        
        logger.LogInformation("Retrieved {AccountCount} accounts for user {UserId}", accounts.Count, userId);

        return accounts;
    }
    
    public async Task<int> UpdateAccountsByPlaidItemIdAsync(string plaidItemId)
    {
        var item = await itemRepository.GetByPlaidIdAsync(plaidItemId);

        if (item == null)
        {
            logger.LogWarning("Item with Plaid ID {PlaidItemId} not found", plaidItemId);
            return 0;
        }

        try
        {
            // Update accounts for the specific item
            var processedCount = await ProcessAccountsForItemAsync(item);
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
        var items = await itemRepository.GetItemsForUpdateAsync(userId);

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

        logger.LogInformation("Completed account update for user {UserId}, processed {AccountCount} accounts", 
            userId, totalProcessed);
    }

    private async Task<int> ProcessAccountsForItemAsync(Item item)
    {
        // Get existing accounts to check which ones need to be updated vs. created
        var existingAccounts = await accountRepository.GetAccountsByItemIdAsync(item.Id);

        // Get latest account data from Plaid
        var data = await client.AccountsGetAsync(new AccountsGetRequest
        {
            AccessToken = item.AccessToken
        });

        var updatedCount = 0;
        var addedCount = 0;

        foreach (var account in data.Accounts)
        {
            if (existingAccounts.TryGetValue(account.AccountId, out var entity))
            {
                var oldBalance = new
                {
                    Current = (decimal?)entity.CurrentBalance,
                    Available = entity.AvailableBalance
                };

                var newBalance = new
                {
                    account.Balances.Current,
                    Available = account.Balances.Available ?? entity.AvailableBalance
                };
                
                // Update existing account
                if (newBalance.Current != null && 
                    (oldBalance.Current != newBalance.Current || newBalance.Available != oldBalance.Available))
                {
                    entity.CurrentBalance = (decimal)newBalance.Current;
                    entity.AvailableBalance = newBalance.Available;
                    
                    logger.LogInformation(
                        "Updated account {PlaidAccountId} (balance: {@Balance} to {@Balance}) for item {ItemId}",
                        account.AccountId, oldBalance, newBalance, item.Id
                    );
                    
                    updatedCount++;
                }
                else if(newBalance.Current == null)
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
                await accountRepository.AddAsync(new Account
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
        await accountRepository.SaveChangesAsync();
        
        logger.LogInformation(
            "Successfully processed accounts for item {ItemId}: {AccountCount} updated, {AddedCount} added",
            item.Id, updatedCount, addedCount
        );
        
        return updatedCount + addedCount;
    }
}