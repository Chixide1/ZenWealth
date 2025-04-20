using Microsoft.EntityFrameworkCore;
using Server.Data.Models;
using Server.Data.Models.Dtos;
using Server.Data.Repositories.Interfaces;

namespace Server.Data.Repositories.Implementations;

public class ItemRepository(AppDbContext context, ILogger<ItemRepository> logger) : IItemRepository
{
    public async Task<bool> ExistsForUserAsync(string userId)
    {
        return await context.Items.AnyAsync(i => i.UserId == userId);
    }

    public async Task<IEnumerable<InstitutionDto>> GetItemsForUserAsync(string userId)
    {
        return await context.Items
            .Where(i => i.UserId == userId)
            .Select(i => new InstitutionDto
            {
                Id = i.Id,
                Name = i.InstitutionName,
            })
            .ToListAsync();
    }

    public async Task<Item?> GetByPlaidIdAsync(string plaidItemId)
    {
        return await context.Items
            .FirstOrDefaultAsync(i => i.PlaidItemId == plaidItemId);
    }

    public async Task<Item?> GetWithAccountsByIdAndUserIdAsync(int itemId, string userId)
    {
        return await context.Items
            .Include(i => i.Accounts)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.UserId == userId);
    }

    public async Task<Item?> GetByIdAndUserIdAsync(int itemId, string userId)
    {
        return await context.Items
            .FirstOrDefaultAsync(i => i.Id == itemId && i.UserId == userId);
    }

    public async Task<ItemDetailsDto?> GetItemDetailsByPlaidIdAsync(string plaidItemId)
    {
        return await context.Items
            .Where(i => i.PlaidItemId == plaidItemId)
            .Join(
                context.Users,
                item => item.UserId,
                user => user.Id,
                (item, user) => new ItemDetailsDto
                {
                    Id = item.Id,
                    PlaidItemId = item.PlaidItemId,
                    InstitutionName = item.InstitutionName,
                    UserEmail = user.Email ?? "",
                    UserId = item.UserId
                }
            )
            .FirstOrDefaultAsync();
    }

    public async Task<List<Item>> GetItemsForUpdateAsync(string userId)
    {
        return await context.Items
            .Where(i => i.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Item> CreateAsync(Item item)
    {
        context.Items.Add(item);
        await context.SaveChangesAsync();
        return item;
    }

    public async Task<Item> UpdateAsync(Item item)
    {
        context.Items.Update(item);
        await context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> DeleteAsync(Item item)
    {
        context.Items.Remove(item);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<HashSet<string>> GetExistingAccountIdsAsync(int itemId)
    {
        var existingIds = await context.Accounts
            .Where(a => a.ItemId == itemId)
            .Select(a => a.PlaidAccountId)
            .ToListAsync();
            
        return existingIds.ToHashSet();
    }

    public async Task<Dictionary<string, int>> GetAccountMappingAsync(List<string?> accountIds)
    {
        var mapping = await context.Accounts
            .Where(a => accountIds.Contains(a.PlaidAccountId))
            .Select(a => new { a.PlaidAccountId, a.Id })
            .ToDictionaryAsync(a => a.PlaidAccountId, a => a.Id);
            
        return mapping;
    }

    public async Task<HashSet<string>> GetExistingTransactionIdsAsync(List<string?> transactionIds)
    {
        var existingIds = await context.Transactions
            .Where(t => transactionIds.Contains(t.PlaidTransactionId))
            .Select(t => t.PlaidTransactionId)
            .ToListAsync();
            
        return existingIds.ToHashSet();
    }

    public async Task AddAccountsAsync(List<Account> accounts)
    {
        if (accounts.Count > 0)
        {
            context.Accounts.AddRange(accounts);
            await context.SaveChangesAsync();
            logger.LogInformation("Added {AccountCount} new accounts", accounts.Count);
        }
    }

    public async Task AddTransactionsAsync(List<Transaction> transactions)
    {
        if (transactions.Count > 0)
        {
            context.Transactions.AddRange(transactions);
            await context.SaveChangesAsync();
            logger.LogInformation("Added {TransactionCount} new transactions", transactions.Count);
        }
    }

    public async Task RemoveAccountsAsync(List<Account> accounts)
    {
        if (accounts.Count > 0)
        {
            context.Accounts.RemoveRange(accounts);
            await context.SaveChangesAsync();
            logger.LogInformation("Removed {RemovedAccountCount} accounts", 
                accounts.Select(a => new {a.Id, a.Name}).ToList());
        }
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
