using Microsoft.Extensions.Logging;
using ZenWealth.Core.Application.Interfaces;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Dtos;
using ZenWealth.Core.Models;

namespace ZenWealth.Core.Application.Services;

internal class TransactionService(
    ITransactionRepository transactionRepository,
    ILogger<TransactionService> logger) : ITransactionsService
{
    public async Task<List<TransactionDto>> GetTransactionsAsync(string userId, TransactionParams transactionParams)
    {
        var transactions = await transactionRepository.GetTransactionsAsync(userId, transactionParams);
        logger.LogInformation("Retrieved {TransactionCount} transactions for user {UserId}", 
            transactions.Count, userId);
        
        return transactions;
    }
    
    public async Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcome(string userId)
    {
        var monthlySummaries = await transactionRepository.GetMonthlyIncomeAndOutcomeAsync(userId);
        var firstSummary = monthlySummaries.FirstOrDefault();
        var lastSummary = monthlySummaries.LastOrDefault();

        if (monthlySummaries.Count == 0 || firstSummary == null || lastSummary == null)
        {
            logger.LogWarning("No monthly summaries for user {UserId}", userId);
            return monthlySummaries;
        }
        
        logger.LogInformation("""
                              Retrieved {MonthlySummariesCount} monthly summaries for user {UserId}. 
                              Beginning Month: {BeginMonth} Ending Month: {EndMonth}
                              """, 
            monthlySummaries.Count, userId, firstSummary.Month, lastSummary.Month);
        
        return monthlySummaries;
    }

    public async Task<RecentTransactionsDto> GetRecentTransactions(string userId, int count = 11)
    {
        var all = await transactionRepository.GetRecentTransactionsAllAsync(userId, count);
        logger.LogInformation("Retrieved {TransactionCount} recent transactions for user {UserId} for both expenses & income",
            all.Count, userId);
        
        var income = await transactionRepository.GetRecentTransactionsIncomeAsync(userId, count);
        logger.LogInformation("Retrieved {TransactionCount} recent income transactions for user {UserId}",
            income.Count, userId);
        
        var expenditure = await transactionRepository.GetRecentTransactionsExpenditureAsync(userId, count);
        logger.LogInformation("Retrieved {TransactionCount} recent expense transactions for user {UserId}",
            expenditure.Count, userId);
        
        return new RecentTransactionsDto
        {
            All = all,
            Income = income,
            Expenditure = expenditure
        };
    }

    public async Task<List<TopExpenseCategoryDto>> GetTopExpenseCategories(string userId)
    {
        var topExpenseCategories = await transactionRepository.GetTopExpenseCategoriesAsync(userId);
        logger.LogInformation("Retrieved {TopExpenseCategoriesCount} top expense categories for user {UserId}", 
            topExpenseCategories.Count, userId);
        
        return topExpenseCategories;
    }

    public async Task<MinMaxAmountDto> GetMinMaxAmount(string userId)
    {
        var minMaxAmount = await transactionRepository.GetMinMaxAmountAsync(userId);
        logger.LogInformation("Retrieved the highest and lowest transaction amount: {@MinMaxAmount}", minMaxAmount);
        
        return minMaxAmount;
    }

    public async Task<List<CategoryTotalDto>> GetTransactionsByCategoryAsync(string userId,
        DateOnly? beginDate = null, DateOnly? endDate = null, int count = 0)
    {
        var categoryTotals = await transactionRepository.GetTransactionsByCategoryAsync(
            userId, beginDate, endDate, count);
        
        logger.LogInformation("""
                              Retrieved {CategoryTotalCount} category totals for user {UserId}. 
                              BeginDate: {BeginDate}, EndDate: {EndDate}
                              """, categoryTotals.Count, userId, beginDate, endDate);
        
        return categoryTotals;
    }

    public async Task<List<FinancialPeriodDto>> GetFinancialPeriods(string userId)
    {
        var financialPeriods = await transactionRepository.GetFinancialPeriodsAsync(userId);
        var firstPeriod = financialPeriods.FirstOrDefault();
        var lastPeriod = financialPeriods.LastOrDefault();

        if (financialPeriods.Count == 0 || firstPeriod == null || lastPeriod == null)
        {
            logger.LogWarning("No financial periods found for user {UserId}", userId);
            return [];
        }
        
        var endDate = new DateOnly(firstPeriod.Year,firstPeriod.Month, 1);
        var beginDate = new DateOnly(lastPeriod.Year, lastPeriod.Month, 1);
        
        logger.LogInformation("""
                                  Retrieved {FinancialPeriodsCount} financial periods for user {UserId}. 
                                  BeginDate: {BeginDate}, EndDate: {EndDate}
                              """, financialPeriods.Count, userId, beginDate, endDate);
        
        return financialPeriods;
    }
}