using Microsoft.EntityFrameworkCore;
using Server.Data.Models;

namespace Server.Data.Services;

public class AccountsService(
    ILogger<AccountsService> logger,
    AppDbContext context) : IAccountsService
{
    /// <summary>
    /// Asynchronously retrieves all accounts for a specified user and returns them as a list of account DTOs.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose accounts are to be retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing a list of account DTOs for the user.</returns>
    public async Task<List<AccountDto>> GetUserAccountsAsync(string userId)
    {
        var accounts = await context.Accounts
            .Where(a => a.UserId == userId)
            .Select(a => new AccountDto()
            {
                Id = a.Id,
                Balance = a.Balance,
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
}