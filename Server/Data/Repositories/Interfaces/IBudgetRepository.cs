using Server.Data.Entities;
using Server.Data.Models;

namespace Server.Data.Repositories.Interfaces;

public interface IBudgetRepository
{
    Task<List<Budget>> GetBudgetsByUserIdAsync(string userId);
    Task<Budget?> GetBudgetByUserIdAndCategoryAsync(string userId, string category);
    Task AddBudgetAsync(Budget budget);
    Task UpdateBudgetAsync(Budget budget);
    Task DeleteBudgetAsync(Budget budget);
    Task SaveChangesAsync();
}