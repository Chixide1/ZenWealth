using Microsoft.EntityFrameworkCore;
using Server.Data.Models;
using Server.Data.Models.Dtos;
using Server.Data.Repositories.Interfaces;

namespace Server.Data.Repositories.Implementations;

public class AccountRepository(AppDbContext context) : IAccountRepository
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

    public async Task AddAccountAsync(Account account)
    {
        await context.Accounts.AddAsync(account);
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