using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Dtos;
using ZenWealth.Core.Models;
using ZenWealth.Core.Utils.Extensions;
using Microsoft.EntityFrameworkCore;
using ZenWealth.Core.Domain.Constants;

namespace ZenWealth.Infrastructure.Persistence.Repositories;

internal class TransactionRepository(AppDbContext context) : ITransactionRepository
{
    public async Task<List<TransactionDto>> GetTransactionsAsync(string userId, TransactionParams queryParams)
    {
        // Always get only the user's transactions
        var transactions = context.Transactions.Where(t => t.UserId == userId);

        // Filters
        if (!string.IsNullOrWhiteSpace(queryParams.Name))
        {
            transactions = transactions.Where(t => t.Name.ToLower()
                .StartsWith(queryParams.Name.ToLower()));
        }
        
        if (queryParams.MinAmount is not null)
        {
            transactions = transactions.Where(t => t.Amount >= queryParams.MinAmount);
        }
        
        if (queryParams.MaxAmount is not null)
        {
            transactions = transactions.Where(t => t.Amount <= queryParams.MaxAmount);
        }

        if (queryParams.BeginDate is not null)
        {
            transactions = transactions.Where(t => t.Date >= queryParams.BeginDate);
        }

        if (queryParams.EndDate is not null)
        {
            transactions = transactions.Where(t => t.Date <= queryParams.EndDate);
        }

        if (queryParams.ExcludeCategories is not null)
        {
            transactions = transactions.Where(t => !queryParams.ExcludeCategories.Contains(t.Category));
        }
        
        if (queryParams.ExcludeAccounts is not null)
        {
            transactions = transactions.Include(t => t.Account)
                .Where(t => !queryParams.ExcludeAccounts.Contains(t.Account.Name));
        }

        // Sorting
        transactions = queryParams.Sort switch
        {
            TransactionSortOption.AMOUNT_ASC => transactions.OrderBy(t => t.Amount)
                .ThenBy(t => t.Id),
            TransactionSortOption.AMOUNT_DESC => transactions.OrderByDescending(t => t.Amount)
                .ThenByDescending(t => t.Id),
            TransactionSortOption.DATE_ASC  => transactions.OrderBy(t => t.Date),
            _ => transactions.OrderByDescending(t => t.Date)
        };

        // Pagination
        if (queryParams.Cursor != 0)
        {
            transactions = queryParams.Sort switch
            {
                TransactionSortOption.AMOUNT_ASC => transactions.Where(t =>
                    t.Amount > queryParams.Amount || (t.Amount == queryParams.Amount && t.Id > queryParams.Cursor)),
                
                TransactionSortOption.AMOUNT_DESC => transactions.Where(t =>
                    t.Amount < queryParams.Amount || (t.Amount == queryParams.Amount && t.Id < queryParams.Cursor)),
                
                TransactionSortOption.DATE_ASC => transactions.Where(t =>
                    t.Date >= queryParams.Date && t.Id >= queryParams.Cursor && t.UserId == userId),
                
                _ => transactions.Where(t => t.Date <= queryParams.Date && t.Id <= queryParams.Cursor)
            };
        }

        // Final Query
        var query = transactions
            .ToTransactionDto()
            .Take(queryParams.PageSize + 1);
        
        return await query.ToListAsync();
    }

    public async Task<HashSet<string>> GetExistingTransactionIdsAsync(List<string?> transactionIds)
    {
        var existingIds = await context.Transactions
            .Where(t => transactionIds.Contains(t.PlaidTransactionId))
            .Select(t => t.PlaidTransactionId)
            .ToListAsync();
            
        return existingIds.ToHashSet();
    }

    public async Task<int> AddRangeAsync(List<Transaction> transactions)
    {
        if (transactions.Count <= 0) return 0;
        
        context.Transactions.AddRange(transactions);
        return await context.SaveChangesAsync();
    }
    
    public async Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcomeAsync(string userId)
    {
        var oneYearAgo = DateOnly.FromDateTime(DateTime.Now.AddYears(-1));
        
        var result = await context.Transactions
            .Where(t => t.UserId == userId && t.Date > oneYearAgo)
            .GroupBy(t => new 
            { 
                Year = t.Date.Year, 
                Month = t.Date.Month
            })
            .Select(g => new 
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Income = g.Where(t => t.Amount < 0).Sum(t => t.Amount),
                Expenditure = g.Where(t => t.Amount > 0).Sum(t => t.Amount)
            })
            .OrderBy(g => g.Year)
            .ThenBy(g => g.Month)
            .ToListAsync();
            
        // Now convert to month names client-side
        return result.Select(r => new MonthlySummaryDto
        {
            Month = new DateTime(r.Year, r.Month, 1).ToString("MMMM"),
            Income = r.Income,
            Expenditure = r.Expenditure
        }).ToList();
    }

    public async Task<List<TransactionDto>> GetRecentTransactionsAllAsync(string userId, int count)
    {
        return await context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Take(count)
            .ToTransactionDto()
            .ToListAsync();
    }

    public async Task<List<TransactionDto>> GetRecentTransactionsIncomeAsync(string userId, int count)
    {
        return await context.Transactions
            .Where(t => t.UserId == userId && t.Amount < 0)
            .OrderByDescending(t => t.Date)
            .Take(count)
            .ToTransactionDto()
            .ToListAsync();
    }

    public async Task<List<TransactionDto>> GetRecentTransactionsExpenditureAsync(string userId, int count)
    {
        return await context.Transactions
            .Where(t => t.UserId == userId && t.Amount > 0)
            .OrderByDescending(t => t.Date)
            .Take(count)
            .ToTransactionDto()
            .ToListAsync();
    }

    public async Task<List<TopExpenseCategoryDto>> GetTopExpenseCategoriesAsync(string userId)
    {
        var oneMonthAgo = DateOnly.FromDateTime(DateTime.Now.AddMonths(-1));
        
        // First, calculate the total expenditure for the last month
        var totalExpenditure = await context.Transactions
            .Where(t => t.Date > oneMonthAgo && t.Amount > 0)
            .SumAsync(t => t.Amount);
            
        // Then, get the top 3 expense categories
        var topCategories = await context.Transactions
            .Where(t => t.UserId == userId && t.Date > oneMonthAgo && t.Amount > 0)
            .GroupBy(t => new { t.Category, t.CategoryIconUrl })
            .Select(g => new TopExpenseCategoryDto
            {
                Category = g.Key.Category,
                IconUrl = g.Key.CategoryIconUrl ?? "",
                Expenditure = g.Sum(t => t.Amount),
                Total = totalExpenditure
            })
            .OrderByDescending(dto => dto.Expenditure)
            .Take(3)
            .ToListAsync();
            
        return topCategories;
    }

    public async Task<MinMaxAmountDto> GetMinMaxAmountAsync(string userId)
    {
        var min = await context.Transactions
            .Where(t => t.UserId == userId)
            .Select(t => t.Amount)
            .MinAsync();
        
        var max = await context.Transactions
            .Where(t => t.UserId == userId)
            .Select(t => t.Amount)
            .MaxAsync();

        return new MinMaxAmountDto() { Min = min, Max = max };
    }

    public async Task<List<CategoryTotalDto>> GetTransactionsByCategoryAsync(
        string userId, 
        DateOnly? beginDate, 
        DateOnly? endDate, 
        int count)
    {
        var transactions = context.Transactions.Where(t => t.UserId == userId);
    
        if (beginDate is not null)
        {
            transactions = transactions.Where(t => t.Date >= beginDate);
        }

        if (endDate is not null)
        {
            transactions = transactions.Where(t => t.Date <= endDate);
        }

        var categoryTotals = transactions
            .GroupBy(t => t.Category)
            .Select(g => new CategoryTotalDto
            {
                Category = g.Key,
                Total = g.Sum(t => t.Amount)
            })
            .Where(t => t.Total > 0);
        
        if (count != 0)
        {
            categoryTotals = categoryTotals.Take(count);
        }
        
        return await categoryTotals
            .OrderByDescending(t => t.Total)
            .ToListAsync();
    }

    public async Task<List<FinancialPeriodDto>> GetFinancialPeriodsAsync(string userId)
    {
        var currentDate = DateOnly.FromDateTime(DateTime.Now);
        var pastYearDate = currentDate.AddMonths(-6);
        
        var results = await context.Transactions
            .Where(t => t.Date >= pastYearDate && t.UserId == userId)
            .GroupBy(t => new
            {
                Year = t.Date.Year,
                Month = t.Date.Month,
                Category = t.Category
            })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Category = g.Key.Category,
                Amount = g.Sum(t => t.Amount),
            })
            .ToListAsync();

        var financialPeriods = results
            .GroupBy(r => new { r.Year, r.Month })
            .Select(periodGroup => new FinancialPeriodDto
            {
                Year = periodGroup.Key.Year,
                Month = periodGroup.Key.Month,
                Categories = periodGroup.ToDictionary(
                    item => item.Category,
                    item => item.Amount
                ),
                Totals = new FinancialPeriodDto.CategoriesTotals
                {
                    Income = periodGroup.Where(item => item.Amount < 0).Sum(item => item.Amount),
                    Expenses = periodGroup.Where(item => item.Amount > 0).Sum(item => item.Amount),
                    NetProfit = 0
                }
            })
            .OrderByDescending(f => f.Year)
            .ThenByDescending(f => f.Month)
            .ToList();
        
        foreach (var f in financialPeriods)
        {
            f.Totals.NetProfit = Math.Abs(f.Totals.Income) - f.Totals.Expenses;
        }
        
        return financialPeriods;
    }
    
    public async Task<int> UpdateRangeAsync(List<Transaction> transactions)
    {
        if (transactions.Count == 0) return 0;
    
        foreach (var transaction in transactions)
        {
            var existingTransaction = await context.Transactions
                .FirstOrDefaultAsync(t => t.PlaidTransactionId == transaction.PlaidTransactionId);
        
            if (existingTransaction != null)
            {
                // Update properties of the existing transaction
                existingTransaction.Name = transaction.Name;
                existingTransaction.Amount = transaction.Amount;
                existingTransaction.Date = transaction.Date;
                existingTransaction.Datetime = transaction.Datetime;
                existingTransaction.Website = transaction.Website;
                existingTransaction.Category = transaction.Category;
                existingTransaction.CategoryIconUrl = transaction.CategoryIconUrl;
                existingTransaction.IsoCurrencyCode = transaction.IsoCurrencyCode;
                existingTransaction.LogoUrl = transaction.LogoUrl;
                existingTransaction.MerchantName = transaction.MerchantName;
                existingTransaction.PaymentChannel = transaction.PaymentChannel;
                existingTransaction.TransactionCode = transaction.TransactionCode;
            
                // AccountId should usually not change, but we'll update it just in case
                existingTransaction.AccountId = transaction.AccountId;
            
                // We don't update UserId or PlaidTransactionId as they are identifiers
            }
        }
    
        return await context.SaveChangesAsync();
    }

    public async Task<int> RemoveByPlaidIdsAsync(List<string> plaidTransactionIds)
    {
        if (plaidTransactionIds.Count == 0) return 0;
    
        var transactionsToRemove = await context.Transactions
            .Where(t => plaidTransactionIds.Contains(t.PlaidTransactionId))
            .ToListAsync();
    
        if (transactionsToRemove.Count == 0) return 0;
    
        context.Transactions.RemoveRange(transactionsToRemove);
        return await context.SaveChangesAsync();
    }
}