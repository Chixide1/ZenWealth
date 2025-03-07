using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Data.DTOs;
using Server.Data.Models;

namespace Server.Services;

public class BudgetsService(
    AppDbContext context,
    UserManager<User> userManager,
    ILogger<BudgetsService> logger
): IBudgetsService
{
    public async Task AddBudgetAsync(Budget budget)
    {
        var prevBudget = await context.Budgets
            .Where((b) => b.UserId == budget.UserId && b.Category == budget.Category)
            .ToListAsync();

        if (prevBudget.Any())
        {
            prevBudget.First().Limit = budget.Limit;
            prevBudget.First().Day = budget.Day;
            
            logger.LogInformation("Changed budget limit {limit} on {category} for user: {userId}", budget.Limit, budget.Category, budget.UserId);
        }
        else
        {
            context.Budgets.Add(budget);
            logger.LogInformation("Added budget limit {limit} on {category} for user: {userId}", budget.Limit, budget.Category, budget.UserId);
        }
            
        await context.SaveChangesAsync();
    }

    public async Task<List<BudgetDto>> GetBudgetsAsync(string userId)
    {
        var currentDate = DateOnly.FromDateTime(DateTime.Now);
        var budgetDate = new DateOnly(currentDate.Year, currentDate.Month, context.Budgets.First().Day);
        
        var budgets = await context.Budgets
            .AsNoTracking()
            .Join(
                context.Transactions,
                b => b.Category,
                t => t.Category,
                (b, t) => new { b, t }
            )
            .Where(x => x.b.UserId == userId && x.t.Date >= budgetDate)
            .GroupBy(
                x => new { x.b.Id, x.b.Category, x.b.Day, x.b.Limit }
            )
            .Select(g => new BudgetDto
            {
                Id = g.Key.Id,
                Category = g.Key.Category,
                Day = g.Key.Day,
                Limit = g.Key.Limit,
                Spent = g.Sum(x => x.t.Amount),
                Remaining = g.Key.Limit - g.Sum(x => x.t.Amount)
            }).ToListAsync();
        
        return budgets;
    }
}