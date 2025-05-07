using Core.Dtos;
using Core.Models;

namespace Core.Application.Interfaces;

/// <summary>
/// Service for retreiving various different analytics on the user's transactions from the Database.
/// </summary>
public interface ITransactionsService
{
    /// <summary>
    /// Asynchronously retrieves a list of transactions and filters & sorts.
    /// </summary>
    Task<List<TransactionDto>> GetTransactionsAsync(string userId, TransactionParams transactionParams);

    /// <summary>
    /// Gets the monthly totals for income and expenses over the last 12 months.
    /// </summary>
    Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcome(string userId);

    /// <summary>
    /// Gets the most recent income & expenses transactions seperated into income, expenses & all.
    /// </summary>
    Task<RecentTransactionsDto> GetRecentTransactions(string userId, int count = 11);

    /// <summary>
    /// Gets the highest 3 expense categories for the current month.
    /// </summary>
    Task<List<TopExpenseCategoryDto>> GetTopExpenseCategories(string userId);

    /// <summary>
    /// Gets the lowest and highest transaction amount.
    /// </summary>
    Task<MinMaxAmountDto> GetMinMaxAmount(string userId);

    /// <summary>
    /// Gets all Transaction Category totals for the provided time frame.
    /// </summary>
    Task<List<CategoryTotalDto>> GetTransactionsByCategoryAsync(string userId, DateOnly? beginDate = null, DateOnly? endDate = null, int count = 0);

    /// <summary>
    /// Gets the category totals for each month within a 6 month timeframe and then calculate the overall total, expenses and net profit.
    /// </summary>
    Task<List<FinancialPeriodDto>> GetFinancialPeriods(string userId);
}