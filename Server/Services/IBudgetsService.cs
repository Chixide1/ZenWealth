using Server.Data.DTOs;
using Server.Data.Models;

namespace Server.Services;

public interface IBudgetsService
{
    Task AddBudgetAsync(Budget budget);
    
    Task<List<BudgetDto>> GetBudgetsAsync(string userId);
    
    Task DeleteBudgetAsync(string category, string userId);
}