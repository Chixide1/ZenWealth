using Going.Plaid;
using Going.Plaid.Transactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Common;
using Server.Data.Models;

namespace Server.Data.Services;

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
    public async Task<List<TransactionDto>> GetTransactionsAsync(
        string userId,
        int id = 0,
        DateOnly date = new DateOnly(),
        int pageSize = 10,
        string? name = null,
        int? minAmount = null,
        int? maxAmount = null,
        DateOnly? beginDate = null,
        DateOnly? endDate = null,
        string? sort = null,
        int[]? excludeId = null,
        double? amount = null
    )
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
            .Select(t => new TransactionDto()
            {
                Id = t.Id,
                Name = t.Name,
                PaymentChannel = t.PaymentChannel,
                AccountId = t.AccountId,
                Amount = t.Amount,
                Date = t.Date,
                Datetime = t.Datetime,
                IsoCurrencyCode = t.IsoCurrencyCode ?? "GBP",
                UnofficialCurrencyCode = t.UnofficialCurrencyCode ?? "GBP",
                PersonalFinanceCategory = t.Category ?? "UNKNOWN",
                MerchantName = t.MerchantName,
                LogoUrl = t.LogoUrl,
                PersonalFinanceCategoryIconUrl = t.CategoryIconUrl,
                TransactionCode = t.TransactionCode
            })
            .Take(pageSize + 1);
        
        logger.LogInformation("Generated SQL is {query}", query.ToQueryString());
        
        var results = await query.ToListAsync();
        
        return results;
    }

    /// <summary>
    /// Asynchronously retrieves the total income and outcome for a specified user in each of the last 12 months.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose transactions are to be retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing a list of monthly expenditure data.</returns>
    public async Task<List<MonthlySummary>> GetMonthlyIncomeAndOutcome(string userId)
    {
        var results = await context.Database.SqlQuery<MonthlySummary>(
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

    public async Task<RecentTransactions> GetRecentTransactions(string userId, int count = 11)
    {
        var all = await context.Transactions.FromSql(
            $"""
             select *
             from Transactions
             order by Date desc
             offset 0 rows fetch next {count} rows only
             """
        ).Select(t => new TransactionDto()
        {
            Id = t.Id,
            Name = t.Name,
            PaymentChannel = t.PaymentChannel,
            AccountId = t.AccountId,
            Amount = t.Amount,
            Date = t.Date,
            Datetime = t.Datetime,
            IsoCurrencyCode = t.IsoCurrencyCode ?? "GBP",
            UnofficialCurrencyCode = t.UnofficialCurrencyCode ?? "GBP",
            PersonalFinanceCategory = t.Category ?? "UNKNOWN",
            MerchantName = t.MerchantName,
            LogoUrl = t.LogoUrl,
            PersonalFinanceCategoryIconUrl = t.CategoryIconUrl,
            TransactionCode = t.TransactionCode
        }).ToListAsync();

        var income = await context.Transactions.FromSql(
            $"""
             select *
             from Transactions
             where Amount < 0
             order by Date desc
             offset 0 rows fetch next {count} rows only
             """
        ).Select(t => new TransactionDto()
        {
            Id = t.Id,
            Name = t.Name,
            PaymentChannel = t.PaymentChannel,
            AccountId = t.AccountId,
            Amount = t.Amount,
            Date = t.Date,
            Datetime = t.Datetime,
            IsoCurrencyCode = t.IsoCurrencyCode ?? "GBP",
            UnofficialCurrencyCode = t.UnofficialCurrencyCode ?? "GBP",
            PersonalFinanceCategory = t.Category ?? "UNKNOWN",
            MerchantName = t.MerchantName,
            LogoUrl = t.LogoUrl,
            PersonalFinanceCategoryIconUrl = t.CategoryIconUrl,
            TransactionCode = t.TransactionCode
        }).ToListAsync();

        var expenditure = await context.Transactions.FromSql(
            $"""
             select *
             from Transactions
             where Amount > 0
             order by Date desc
             offset 0 rows fetch next {count} rows only
             """
        ).Select(t => new TransactionDto()
        {
            Id = t.Id,
            Name = t.Name,
            PaymentChannel = t.PaymentChannel,
            AccountId = t.AccountId,
            Amount = t.Amount,
            Date = t.Date,
            Datetime = t.Datetime,
            IsoCurrencyCode = t.IsoCurrencyCode ?? "GBP",
            UnofficialCurrencyCode = t.UnofficialCurrencyCode ?? "GBP",
            PersonalFinanceCategory = t.Category ?? "UNKNOWN",
            MerchantName = t.MerchantName,
            LogoUrl = t.LogoUrl,
            PersonalFinanceCategoryIconUrl = t.CategoryIconUrl,
            TransactionCode = t.TransactionCode
        }).ToListAsync();
        
        return new RecentTransactions()
        {
            All = all,
            Income = income,
            Expenditure = expenditure
        };
    }

    public async Task<List<TopExpenseCategory>> GetTopExpenseCategories(string userId)
    {
        var results = await context.Database.SqlQuery<TopExpenseCategory>(
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
}