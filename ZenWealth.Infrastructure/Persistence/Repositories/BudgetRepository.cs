﻿using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ZenWealth.Infrastructure.Persistence.Repositories;

internal class BudgetRepository(AppDbContext context) : IBudgetRepository
{
    public async Task<List<Budget>> GetBudgetsByUserIdAsync(string userId)
    {
        return await context.Budgets
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .ToListAsync();
    }

    public async Task<Budget?> GetBudgetByUserIdAndCategoryAsync(string userId, string category)
    {
        return await context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Category == category);
    }

    public async Task AddBudgetAsync(Budget budget)
    {
        await context.Budgets.AddAsync(budget);
    }

    public Task UpdateBudgetAsync(Budget budget)
    {
        context.Budgets.Update(budget);
        return Task.CompletedTask;
    }

    public async Task DeleteBudgetAsync(Budget budget)
    {
        context.Budgets.Remove(budget);
        await context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}