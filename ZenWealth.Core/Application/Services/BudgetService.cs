﻿using Microsoft.Extensions.Logging;
using ZenWealth.Core.Application.Interfaces;
using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Models;

namespace ZenWealth.Core.Application.Services;

internal class BudgetService(
    ILogger<BudgetService> logger,
    IBudgetRepository budgetRepository,
    ITransactionRepository transactionRepository
): IBudgetsService
{
    protected virtual DateOnly GetCurrentDate()
    {
        return DateOnly.FromDateTime(DateTime.Now);
    }

    public async Task AddBudgetAsync(Budget budget)
    {
        var existingBudget = await budgetRepository.GetBudgetByUserIdAndCategoryAsync(budget.UserId, budget.Category);

        if (existingBudget != null)
        {
            logger.LogInformation("Retrieved budget {BudgetId} for user: {UserId}", 
                budget.Id, budget.UserId);
            
            existingBudget.Limit = budget.Limit;
            existingBudget.Day = budget.Day;
            
            logger.LogInformation("Changed budget limit {BudgetLimit} on {BudgetCategory} for user: {UserId}", 
                budget.Limit, budget.Category, budget.UserId);
        }
        else
        {
            await budgetRepository.AddBudgetAsync(budget);
            logger.LogInformation("Added budget limit {BudgetLimit} on {BudgetCategory} for user: {UserId}", 
                budget.Limit, budget.Category, budget.UserId);
        }
            
        await budgetRepository.SaveChangesAsync();
    }

    public async Task<List<BudgetDto>> GetBudgetsAsync(string userId)
    {
        var currentDate = GetCurrentDate();
        var userBudgets = await budgetRepository.GetBudgetsByUserIdAsync(userId);
        
        logger.LogInformation("Retrieved {BudgetCount} budgets for user {UserId}", userBudgets.Count, userId);
    
        var budgetDate = new DateOnly(currentDate.Year, currentDate.Month,
            userBudgets.Count > 0 ? userBudgets[0].Day : 1);
        // If budget day is after current day, use previous month
        if (budgetDate.Day > currentDate.Day)
        {
            budgetDate = budgetDate.AddMonths(-1);
        }
        
        // Sum transactions for this category since the budget start date
        var categoryTotals = await transactionRepository.GetTransactionsByCategoryAsync(
            userId, budgetDate, null, 0
        );
        
        logger.LogInformation("Retrieved category totals for user {UserId} from {BudgetStartDate}",
            userId, budgetDate);

        var budgets = userBudgets.Select(b => new BudgetDto
        {
            Category = b.Category,
            Day = b.Day,
            Limit = b.Limit,
            Spent = GetSpentAmount(b.Category),
            Remaining = b.Limit - GetSpentAmount(b.Category)
        }).ToList();
    
        return budgets;

        decimal GetSpentAmount(string category)
        {
            return categoryTotals.FirstOrDefault(t => t.Category == category)?.Total ?? 0;
        }
    }

    public async Task DeleteBudgetAsync(string category, string userId)
    {
        var budget = await budgetRepository.GetBudgetByUserIdAndCategoryAsync(userId, category.ToUpper());
        
        if (budget != null)
        {
            await budgetRepository.DeleteBudgetAsync(budget);
            logger.LogInformation("Deleted budget category {BudgetCategory} for user: {UserId}", category, userId);
        }
    }
}