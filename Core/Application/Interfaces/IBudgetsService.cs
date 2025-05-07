using Core.Domain.Entities;
using Core.Models;

namespace Core.Application.Interfaces;

/// <summary>
/// Service used for Budgets management.
/// </summary>
public interface IBudgetsService
{
    /// <summary>
    /// Creates new budgets for the given user.
    /// </summary>
    Task AddBudgetAsync(Budget budget);

    /// <summary>
    /// Gets the budgets for a user.
    /// </summary>
    Task<List<BudgetDto>> GetBudgetsAsync(string userId);

    /// <summary>
    /// Deletes existing budgets for a user.
    /// </summary>
    Task DeleteBudgetAsync(string category, string userId);
}