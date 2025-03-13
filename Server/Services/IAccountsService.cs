using Server.Data.DTOs;

namespace Server.Services;

public interface IAccountsService
{
    Task<List<AccountDto>> GetAccountsAsync(string userId);
    
    Task UpdateAccountsAsync(string userId);
}