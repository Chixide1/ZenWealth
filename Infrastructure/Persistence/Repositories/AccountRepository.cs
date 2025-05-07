using Core.Domain.Entities;
using Core.Domain.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

internal class AccountRepository(AppDbContext context) : IAccountRepository
{
    public async Task<List<AccountDto>> GetAccountsByUserIdAsync(string userId)
    {
        return await context.Accounts
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
    }

    public async Task<Dictionary<string, Account>> GetAccountsByItemIdAsync(int itemId)
    {
        return await context.Accounts
            .Where(a => a.ItemId == itemId)
            .ToDictionaryAsync(a => a.PlaidAccountId, a => a);
    }

    public async Task<Account?> GetAccountByPlaidAccountIdAsync(string plaidAccountId)
    {
        return await context.Accounts
            .FirstOrDefaultAsync(a => a.PlaidAccountId == plaidAccountId);
    }

    public async Task AddAsync(Account account)
    {
        await context.Accounts.AddAsync(account);
        await context.SaveChangesAsync();
    }
    
    public async Task AddRangeAsync(List<Account> accounts)
    {
        if (accounts.Count > 0)
        {
            await context.Accounts.AddRangeAsync(accounts);
            await context.SaveChangesAsync();
        }
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
    
    public async Task RemoveRangeAsync(List<Account> accounts)
    {
        if (accounts.Count > 0)
        {
            context.Accounts.RemoveRange(accounts);
            await context.SaveChangesAsync();
        }
    }
    
    public Task UpdateAccountAsync(Account account)
    {
        context.Accounts.Update(account);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}