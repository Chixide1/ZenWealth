using Core.Domain.Entities;

namespace Core.Domain.Interfaces;

/// <summary>
/// Repository interface for managing budget operations
/// </summary>
public interface IBudgetRepository
{
    /// <summary>
    /// Retrieves all budgets for a specified user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A list of budgets associated with the user</returns>
    Task<List<Budget>> GetBudgetsByUserIdAsync(string userId);
    
    /// <summary>
    /// Retrieves a specific budget for a user based on category
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="category">The budget category to retrieve</param>
    /// <returns>The budget for the specified category if found, otherwise null</returns>
    Task<Budget?> GetBudgetByUserIdAndCategoryAsync(string userId, string category);
    
    /// <summary>
    /// Adds a new budget to the database
    /// </summary>
    /// <param name="budget">The budget to add</param>
    Task AddBudgetAsync(Budget budget);
    
    /// <summary>
    /// Updates an existing budget in the database
    /// </summary>
    /// <param name="budget">The budget with updated values</param>
    Task UpdateBudgetAsync(Budget budget);
    
    /// <summary>
    /// Deletes a budget from the database
    /// </summary>
    /// <param name="budget">The budget to delete</param>
    Task DeleteBudgetAsync(Budget budget);
    
    /// <summary>
    /// Saves changes made to the database
    /// </summary>
    Task SaveChangesAsync();
}