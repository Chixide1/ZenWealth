using Server.Data.Models.Dtos;
using Server.Data.Models.Requests;
using Server.Data.Repositories.Interfaces;
using Server.Services.Interfaces;

namespace Server.Services.Implementations;

public class TransactionsService(
    ITransactionRepository transactionRepository
) : ITransactionsService
{
    public async Task<List<TransactionDto>> GetTransactionsAsync(string userId, GetTransactionsRequest request)
    {
        return await transactionRepository.GetTransactionsAsync(userId, request);
    }
    
    public async Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcome(string userId)
    {
        return await transactionRepository.GetMonthlyIncomeAndOutcomeAsync(userId);
    }

    public async Task<RecentTransactionsDto> GetRecentTransactions(string userId, int count = 11)
    {
        var all = await transactionRepository.GetRecentTransactionsAllAsync(userId, count);
        var income = await transactionRepository.GetRecentTransactionsIncomeAsync(userId, count);
        var expenditure = await transactionRepository.GetRecentTransactionsExpenditureAsync(userId, count);
        
        return new RecentTransactionsDto()
        {
            All = all,
            Income = income,
            Expenditure = expenditure
        };
    }

    public async Task<List<TopExpenseCategoryDto>> GetTopExpenseCategories(string userId)
    {
        return await transactionRepository.GetTopExpenseCategoriesAsync(userId);
    }

    public async Task<MinMaxAmountDto> GetMinMaxAmount(string userId)
    {
        return await transactionRepository.GetMinMaxAmountAsync(userId);
    }

    public async Task<List<CategoryTotalDto>> GetTransactionsByCategoryAsync(
        string userId,
        DateOnly? beginDate = null,
        DateOnly? endDate = null,
        int count = 0)
    {
        return await transactionRepository.GetTransactionsByCategoryAsync(userId, beginDate, endDate, count);
    }

    public async Task<List<FinancialPeriodDto>> GetFinancialPeriods(string userId)
    {
        return await transactionRepository.GetFinancialPeriodsAsync(userId);
    }
}