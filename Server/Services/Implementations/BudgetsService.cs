using Server.Data.Models;
using Server.Data.Models.Dtos;
using Server.Data.Repositories.Interfaces;
using Server.Services.Interfaces;

namespace Server.Services.Implementations;

public class BudgetsService(
    ILogger<BudgetsService> logger,
    IBudgetRepository budgetRepository,
    ITransactionRepository transactionRepository
): IBudgetsService
{
    public async Task AddBudgetAsync(Budget budget)
    {
        var existingBudget = await budgetRepository.GetBudgetByUserIdAndCategoryAsync(budget.UserId, budget.Category);

        if (existingBudget != null)
        {
            existingBudget.Limit = budget.Limit;
            existingBudget.Day = budget.Day;
            
            logger.LogInformation("Changed budget limit {limit} on {category} for user: {userId}", 
                budget.Limit, budget.Category, budget.UserId);
        }
        else
        {
            await budgetRepository.AddBudgetAsync(budget);
            logger.LogInformation("Added budget limit {limit} on {category} for user: {userId}", 
                budget.Limit, budget.Category, budget.UserId);
        }
            
        await budgetRepository.SaveChangesAsync();
    }

    public async Task<List<BudgetDto>> GetBudgetsAsync(string userId)
    {
        var currentDate = DateOnly.FromDateTime(DateTime.Now);
        var userBudgets = await budgetRepository.GetBudgetsByUserIdAsync(userId);
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
            var transactions = await transactionRepository.GetTransactionsByCategoryAsync(
                userId, 
                budgetDate, 
                null, 
                0);
                
            var spent = transactions
                .FirstOrDefault(t => t.Category == budget.Category)?.Total ?? 0;
        
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
        var budget = await budgetRepository.GetBudgetByUserIdAndCategoryAsync(userId, category.ToUpper());
        
        if (budget != null)
        {
            await budgetRepository.DeleteBudgetAsync(budget);
            logger.LogInformation("Deleted budget category {category} for user: {userId}", category, userId);
            await budgetRepository.SaveChangesAsync();
        }
    }
}