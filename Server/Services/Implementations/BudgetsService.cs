using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Data.Models;
using Server.Data.Models.Dtos;
using Server.Services.Interfaces;

namespace Server.Services.Implementations;

public class BudgetsService(
    AppDbContext context,
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
    
        // First, get all budgets for this user
        var userBudgets = await context.Budgets
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .ToListAsync();
    
        var result = new List<BudgetDto>();
    
        foreach (var budget in userBudgets)
        {
            // Calculate the start date for this specific budget
            var budgetDate = new DateOnly(currentDate.Year, currentDate.Month, budget.Day);
        
            // If budget day is after current day, use previous month
            if (budgetDate > currentDate)
            {
                budgetDate = budgetDate.AddMonths(-1);
            }
        
            // Sum transactions for this category since the budget start date
            var spent = await context.Transactions
                .Where(t => t.UserId == userId && 
                            t.Category == budget.Category && 
                            t.Date >= budgetDate)
                .SumAsync(t => t.Amount);
        
            result.Add(new BudgetDto
            {
                Category = budget.Category,
                Day = budget.Day,
                Limit = budget.Limit,
                Spent = spent,
                Remaining = budget.Limit - spent
            });
        }
    
        return result;
    }

    public async Task DeleteBudgetAsync(string category, string userId)
    {
        var budgets = context.Budgets
            .Where(b => b.Category == category.ToUpper() && b.UserId == userId)
            .ToList();
        
        foreach (var budget in budgets)
        {
            Console.WriteLine(budget.Category + " - " + "Tried to delete");
            context.Budgets.Remove(budget);
            logger.LogInformation("Deleted budget category {category} for user: {userId}", category, userId);
            await context.SaveChangesAsync();
        }
    }
}