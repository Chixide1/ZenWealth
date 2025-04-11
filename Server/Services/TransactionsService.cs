using Going.Plaid;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Data.DTOs;
using Server.Data.Models;
using Server.Extensions;

namespace Server.Services;

public class TransactionsService(
    AppDbContext context
) : ITransactionsService
{
    public async Task<List<TransactionDto>> GetTransactionsAsync(string userId,
        int id = 0,
        DateOnly date = new(),
        int pageSize = 10,
        string? name = null,
        decimal? minAmount = null,
        decimal? maxAmount = null,
        DateOnly? beginDate = null,
        DateOnly? endDate = null,
        string? sort = null,
        decimal? amount = null,
        string[]? excludeCategories = null,
        string[]? excludeAccounts = null)
    {
        // Always get only the user's transactions
        var transactions = context.Transactions.Where(t => t.UserId == userId);

        // Filters
        if (!string.IsNullOrWhiteSpace(name))
        {
            transactions = transactions.Where(t => t.Name.StartsWith(name));
        }
        
        if (minAmount is not null)
        {
            transactions = transactions.Where(t => t.Amount >= minAmount);
        }
        
        if (maxAmount is not null)
        {
            transactions = transactions.Where(t => t.Amount <= maxAmount);
        }

        if (beginDate is not null)
        {
            transactions = transactions.Where(t => t.Date >= beginDate);
        }

        if (endDate is not null)
        {
            transactions = transactions.Where(t => t.Date <= endDate);
        }

        if (excludeCategories is not null)
        {
            transactions = transactions.Where(t => !excludeCategories.Contains(t.Category));
        }
        
        if (excludeAccounts is not null)
        {
            transactions = transactions.Include(t => t.Account)
                .Where(t => !excludeAccounts.Contains(t.Account.Name));
        }

        // Sorting
        transactions = sort?.ToLower() switch
        {
            "amount-asc" => transactions.OrderBy(t => t.Amount)
                .ThenBy(t => t.Id),
            "amount-desc" => transactions.OrderByDescending(t => t.Amount)
                .ThenByDescending(t => t.Id),
            "date-asc"  => transactions.OrderBy(t => t.Date),
            _ => transactions.OrderByDescending(t => t.Date)
        };

        // Pagination
        if (id != 0)
        {
            if (sort?.ToLower() == "amount-asc")
            {
                transactions = transactions.Where(t => t.Amount > amount || (t.Amount == amount && t.Id > id) );
            }
            else if (sort?.ToLower() == "amount-desc")
            {
                transactions = transactions.Where(t => t.Amount < amount || (t.Amount == amount && t.Id < id));
            }
            else if (sort?.ToLower() == "date-asc")
            {
                transactions = transactions.Where(t => t.Date >= date && t.Id >= id && t.UserId == userId);
            }
            else
            {
                transactions = transactions.Where(t => t.Date <= date && t.Id <= id);
            }
        }

        // Final Query
        var query = transactions
            .ToTransactionDto()
            .Take(pageSize + 1);
        
        var results = await query.ToListAsync();
        
        return results;
    }
    
    public async Task<List<MonthlySummaryDto>> GetMonthlyIncomeAndOutcome(string userId)
    {
        var results = await context.Database.SqlQuery<MonthlySummaryDto>(
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

        return results;
    }

    public async Task<RecentTransactionsDto> GetRecentTransactions(string userId, int count = 11)
    {
        var all = await context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Take(count)
            .ToTransactionDto()
            .ToListAsync();

        var income = await context.Transactions
            .Where(t => t.Amount < 0)
            .OrderByDescending(t => t.Date)
            .Take(count)
            .ToTransactionDto()
            .ToListAsync();
            
        var expenditure = await context.Transactions
            .Where(t => t.Amount > 0)
            .OrderByDescending(t => t.Date)
            .Take(count)
            .ToTransactionDto()
            .ToListAsync();
        
        return new RecentTransactionsDto()
        {
            All = all,
            Income = income,
            Expenditure = expenditure
        };
    }

    public async Task<List<TopExpenseCategoryDto>> GetTopExpenseCategories(string userId)
    {
        var results = await context.Database.SqlQuery<TopExpenseCategoryDto>(
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

        return results;
    }

    public async Task<MinMaxAmountDto> GetMinMaxAmount(string userId)
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
        DateOnly? beginDate = null,
        DateOnly? endDate = null,
        int count = 0
    )
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
            .ToListAsync();;
    }

    public async Task<List<FinancialPeriodDto>> GetFinancialPeriods(string userId)
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