using Microsoft.EntityFrameworkCore;
using Server.Data.Entities;
using Server.Data.Models;
using Server.Data.Models.Dtos;
using Server.Data.Models.Requests;
using Server.Data.Repositories.Interfaces;
using Server.Utils.Extensions;

namespace Server.Data.Repositories.Implementations;

public class TransactionRepository(AppDbContext context) : ITransactionRepository
{
    public async Task<List<TransactionDto>> GetTransactionsAsync(string userId, GetTransactionsRequest request)
    {
        // Always get only the user's transactions
        var transactions = context.Transactions.Where(t => t.UserId == userId);

        // Filters
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            transactions = transactions.Where(t => t.Name.StartsWith(request.Name));
        }
        
        if (request.MinAmount is not null)
        {
            transactions = transactions.Where(t => t.Amount >= request.MinAmount);
        }
        
        if (request.MaxAmount is not null)
        {
            transactions = transactions.Where(t => t.Amount <= request.MaxAmount);
        }

        if (request.BeginDate is not null)
        {
            transactions = transactions.Where(t => t.Date >= request.BeginDate);
        }

        if (request.EndDate is not null)
        {
            transactions = transactions.Where(t => t.Date <= request.EndDate);
        }

        if (request.ExcludeCategories is not null)
        {
            transactions = transactions.Where(t => !request.ExcludeCategories.Contains(t.Category));
        }
        
        if (request.ExcludeAccounts is not null)
        {
            transactions = transactions.Include(t => t.Account)
                .Where(t => !request.ExcludeAccounts.Contains(t.Account.Name));
        }

        // Sorting
        transactions = request.Sort?.ToLower() switch
        {
            "amount-asc" => transactions.OrderBy(t => t.Amount)
                .ThenBy(t => t.Id),
            "amount-desc" => transactions.OrderByDescending(t => t.Amount)
                .ThenByDescending(t => t.Id),
            "date-asc"  => transactions.OrderBy(t => t.Date),
            _ => transactions.OrderByDescending(t => t.Date)
        };

        // Pagination
        if (request.Cursor != 0)
        {
            if (request.Sort?.ToLower() == "amount-asc")
            {
                transactions = transactions.Where(t => t.Amount > request.Amount || (t.Amount == request.Amount && t.Id > request.Cursor));
            }
            else if (request.Sort?.ToLower() == "amount-desc")
            {
                transactions = transactions.Where(t => t.Amount < request.Amount || (t.Amount == request.Amount && t.Id < request.Cursor));
            }
            else if (request.Sort?.ToLower() == "date-asc")
            {
                transactions = transactions.Where(t => t.Date >= request.Date && t.Id >= request.Cursor && t.UserId == userId);
            }
            else
            {
                transactions = transactions.Where(t => t.Date <= request.Date && t.Id <= request.Cursor);
            }
        }

        // Final Query
        var query = transactions
            .ToTransactionDto()
            .Take(request.PageSize + 1);
        
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

    public async Task AddRangeAsync(List<Transaction> transactions)
    {
        if (transactions.Count > 0)
        {
            context.Transactions.AddRange(transactions);
            await context.SaveChangesAsync();
        }
    }
    
    public async Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcomeAsync(string userId)
    {
        return await context.Database.SqlQuery<MonthlySummaryDto>(
            $"""
             SELECT
                 DATENAME(Month, Date) as Month,
                 SUM(IIF(Amount < 0, Amount, 0)) AS Income,
                 SUM(IIF(Amount > 0, Amount, 0) ) AS Expenditure
             FROM Transactions
             WHERE UserId = {userId} and Date > DATEADD(Year, -1, GETDATE())
             GROUP BY Year(Date), MONTH(Date), DATENAME(Month, Date)
             order by YEAR(Date), MONTH(Date)
             """
        ).ToListAsync();
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
        return await context.Database.SqlQuery<TopExpenseCategoryDto>(
            $"""
             select top 3
                 Category as Category,
                 CategoryIconUrl as IconUrl,
                 Sum(Amount) as Expenditure,
                 (select SUM(Amount) from Transactions where Date > DATEADD(month, -1, GETDATE()) and Amount > 0) as Total
             from Transactions
             where UserId={userId} and Date > DATEADD(month, -1, GETDATE()) and Amount > 0
             group by Category, CategoryIconUrl
             order by Expenditure desc
             """
        ).ToListAsync();
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
}