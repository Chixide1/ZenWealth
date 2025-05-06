using Core.Dtos;
using Core.Entities;
using Core.Models;

namespace Core.Interfaces;

/// <summary>
/// Repository interface for managing transaction operations
/// </summary>
public interface ITransactionRepository
{
    /// <summary>
    /// Retrieves filtered transactions for a user based on the provided request parameters
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="queryParams">The request containing filter, sort, and pagination parameters</param>
    /// <returns>A list of transaction DTOs matching the criteria</returns>
    Task<List<TransactionDto>> GetTransactionsAsync(string userId, TransactionParams queryParams);
    
    /// <summary>
    /// Gets existing transaction IDs
    /// </summary>
    /// <param name="transactionIds">List of transaction IDs to check</param>
    /// <returns>A HashSet of transaction IDs that already exist in the database</returns>
    Task<HashSet<string>> GetExistingTransactionIdsAsync(List<string?> transactionIds);

    /// <summary>
    /// Adds multiple transactions to the Database
    /// </summary>
    /// <param name="transactions">The list of transactions to add</param>
    Task<int> AddRangeAsync(List<Transaction> transactions);
    
    /// <summary>
    /// Retrieves monthly income and expense summaries for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A list of monthly summary DTOs showing income and expenses</returns>
    Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcomeAsync(string userId);
    
    /// <summary>
    /// Retrieves a specified number of recent transactions for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="count">The maximum number of transactions to retrieve</param>
    /// <returns>A list of the most recent transaction DTOs</returns>
    Task<List<TransactionDto>> GetRecentTransactionsAllAsync(string userId, int count);
    
    /// <summary>
    /// Retrieves a specified number of recent income transactions for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="count">The maximum number of transactions to retrieve</param>
    /// <returns>A list of the most recent income transaction DTOs</returns>
    Task<List<TransactionDto>> GetRecentTransactionsIncomeAsync(string userId, int count);
    
    /// <summary>
    /// Retrieves a specified number of recent expenditure transactions for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="count">The maximum number of transactions to retrieve</param>
    /// <returns>A list of the most recent expenditure transaction DTOs</returns>
    Task<List<TransactionDto>> GetRecentTransactionsExpenditureAsync(string userId, int count);
    
    /// <summary>
    /// Retrieves the top expense categories for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A list of the top expense categories with their totals</returns>
    Task<List<TopExpenseCategoryDto>> GetTopExpenseCategoriesAsync(string userId);
    
    /// <summary>
    /// Retrieves the minimum and maximum transaction amounts for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A DTO containing the minimum and maximum transaction amounts</returns>
    Task<MinMaxAmountDto> GetMinMaxAmountAsync(string userId);

    /// <summary>
    /// Gets each expense category's total for the time period provided for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="beginDate">The beginning of the time period</param>
    /// <param name="endDate">The end of the time period</param>
    /// <param name="count">Specifies how many categories should be returned. If 0, all categories will be returned</param>
    /// <returns>A list of categories with their total expenses</returns>
    Task<List<CategoryTotalDto>> GetTransactionsByCategoryAsync(string userId, DateOnly? beginDate, DateOnly? endDate, int count);
    
    /// <summary>
    /// Retrieves financial period summaries for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A list of financial period DTOs with category breakdowns and totals</returns>
    Task<List<FinancialPeriodDto>> GetFinancialPeriodsAsync(string userId);
    
    Task<int> UpdateRangeAsync(List<Transaction> transactions);
    Task<int> RemoveByPlaidIdsAsync(List<string> plaidTransactionIds);
}