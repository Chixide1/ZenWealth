using Microsoft.EntityFrameworkCore;
using Server.Data.Models;

namespace Server.Data.Services;

public class BudgetsService(
    AppDbContext context,
    ILogger<BudgetsService> logger
): IBudgetsService
{
    public async Task AddBudgetAsync(string userId, Budget budget)
    {
        await context.Budgets.AddAsync(budget);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Added budget limit {limit} on {category} for user: {userId}", budget.Limit, budget.Category, budget.UserId);
    }

    public async Task<List<Budget>> GetBudgetsAsync(string userId)
    {
        var budgets = await context.Budgets.ToListAsync();
        return budgets;
    }
}