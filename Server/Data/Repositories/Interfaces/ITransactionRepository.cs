using Server.Data.Entities;
using Server.Data.Models.Dtos;
using Server.Data.Models.Requests;

namespace Server.Data.Repositories.Interfaces;

public interface ITransactionRepository
{
    Task<List<TransactionDto>> GetTransactionsAsync(string userId, GetTransactionsRequest request);
    
    /// <summary>
    /// Gets existing transaction IDs
    /// </summary>
    Task<HashSet<string>> GetExistingTransactionIdsAsync(List<string?> transactionIds);
    
    /// <summary>
    /// Adds multiple transactions
    /// </summary>
    Task AddRangeAsync(List<Transaction> transactions);
    
    Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcomeAsync(string userId);
    Task<List<TransactionDto>> GetRecentTransactionsAllAsync(string userId, int count);
    Task<List<TransactionDto>> GetRecentTransactionsIncomeAsync(string userId, int count);
    Task<List<TransactionDto>> GetRecentTransactionsExpenditureAsync(string userId, int count);
    Task<List<TopExpenseCategoryDto>> GetTopExpenseCategoriesAsync(string userId);
    Task<MinMaxAmountDto> GetMinMaxAmountAsync(string userId);
    Task<List<CategoryTotalDto>> GetTransactionsByCategoryAsync(string userId, DateOnly? beginDate, DateOnly? endDate, int count);
    Task<List<FinancialPeriodDto>> GetFinancialPeriodsAsync(string userId);
}