using Going.Plaid;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Data.DTOs;
using Server.Data.Models;
using Server.Extensions;

namespace Server.Services;

/// <summary>
/// The Service where the business logic for transactions is implemented.
/// </summary>
/// <remarks>
/// Also used as the Data Access Layer and Plaid API wrapper.
/// </remarks>
public class TransactionsService(
    AppDbContext context,
    PlaidClient client,
    ILogger<TransactionsService> logger
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
        
        logger.LogInformation("Generated SQL is {query}", query.ToQueryString());
        
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
    
    // Add to TransactionsService.cs
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

    public async Task<List<MonthlyBreakdown>> GetMonthlyBreadowns(string userId)
    {
        var currentDate = DateOnly.FromDateTime(DateTime.Now);
        var pastYearDate = currentDate.AddYears(-1);

        var result = await context.Transactions
            .Where(t => t.Date >= pastYearDate && t.UserId == userId) // Filter for the past year
            .GroupBy(t => new 
            { 
                Year = t.Date.Year, 
                Month = t.Date.Month, 
                Category = t.Category
            })
            .Select(g=> new MonthlyBreakdownDto
            {
                Type = g.Sum(t => t.Amount) > 0 ? "Expenditure" : "Income",
                Month = g.Key.Month,
                Year = g.Key.Year,
                Category = g.Key.Category,
                Total = g.Sum(t => t.Amount)
            })
            .OrderByDescending(r => r.Year)
            .ThenByDescending(r => r.Month)
            .ToListAsync();
        
        var monthlyBreakdowns = result
            .GroupBy(t => new { t.Year, t.Month })
            .Select(g => new MonthlyBreakdown
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Income = g.Where(t => t.Type == "Income")
                    .Select(t => new CategoryTotalDto 
                    { 
                        Category = t.Category, 
                        Total = t.Total 
                    })
                    .ToList(),
                Expenditure = g.Where(t => t.Type == "Expenditure")
                    .Select(t => new CategoryTotalDto 
                    { 
                        Category = t.Category, 
                        Total = t.Total 
                    })
                    .ToList(),
                NetProfit = g.Where(t => t.Type == "Income").Sum(t => t.Total) - 
                            g.Where(t => t.Type == "Expenditure").Sum(t => t.Total)
            })
            .OrderByDescending(m => m.Year)
            .ThenByDescending(m => m.Month)
            .ToList();
        
        return monthlyBreakdowns;
    }
}