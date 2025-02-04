using Going.Plaid;
using Going.Plaid.Transactions;
using Microsoft.EntityFrameworkCore;
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
    /// <summary>
    /// Asynchronously retrieves all transactions for a specified user and returns them as a list of stripped transactions.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose transactions are to be retrieved.</param>
    /// <param name="id">Used for pagination</param>
    /// <param name="date"></param>
    /// <param name="pageSize">The amount of results returned</param>
    /// <param name="id"></param>
    /// <returns>A task representing the asynchronous operation, containing a list of stripped transactions for the user.</returns>
    public async Task<List<TransactionDto>> GetTransactionsAsync(string userId, int id, DateOnly date = new DateOnly(), int pageSize = 10)
    {
        if (id == 0 || pageSize < 1)
        {
            var startTransactions = await context.Transactions
                .FromSql(
                    $"""
                     select *
                     from Transactions
                     where UserId = {userId}
                     order by Date desc
                     offset 0 rows fetch next {11} rows only
                     """
                )
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
                    PersonalFinanceCategory = t.PersonalFinanceCategory ?? "UNKNOWN",
                    MerchantName = t.MerchantName,
                    LogoUrl = t.LogoUrl,
                    PersonalFinanceCategoryIconUrl = t.PersonalFinanceCategoryIconUrl,
                    TransactionCode = t.TransactionCode
                })
                .ToListAsync();

            return startTransactions;
        }
        
        var transactions = await context.Transactions
            .FromSql(
                $"""
                 select *
                 from Transactions
                 where Date <= {date} and id <= {id} and UserId = {userId}
                 order by Date desc
                 offset 0 rows fetch next {pageSize + 1} rows only
                 """
                )
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
                PersonalFinanceCategory = t.PersonalFinanceCategory ?? "UNKNOWN",
                MerchantName = t.MerchantName,
                LogoUrl = t.LogoUrl,
                PersonalFinanceCategoryIconUrl = t.PersonalFinanceCategoryIconUrl,
                TransactionCode = t.TransactionCode
            })
            .ToListAsync();

        return transactions;
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
             SELECT MonthName, Income, Expenditure
             FROM (
                 SELECT 
                     DATENAME(MONTH, Date) AS MonthName,
                     SUM(IIF(Amount < 0, Amount, 0)) AS Income,
                     SUM(IIF(Amount > 0, Amount, 0) ) AS Expenditure
                 FROM Transactions
                 WHERE  UserId = {userId} AND Date > DATEADD(Year, -1, GETDATE())
                 GROUP BY DATENAME(MONTH, Date)
                  ) as data
             ORDER BY CASE
                 WHEN MonthName = 'January' THEN 1
                 WHEN MonthName = 'February' THEN 2
                 WHEN MonthName = 'March' THEN 3
                 WHEN MonthName = 'April' THEN 4
                 WHEN MonthName = 'May' THEN 5
                 WHEN MonthName = 'June' THEN 6
                 WHEN MonthName = 'July' THEN 7
                 WHEN MonthName = 'August' THEN 8
                 WHEN MonthName = 'September' THEN 9
                 WHEN MonthName = 'October' THEN 10
                 WHEN MonthName = 'November' THEN 11
                 WHEN MonthName = 'December' THEN 12
                 END;
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
            PersonalFinanceCategory = t.PersonalFinanceCategory ?? "UNKNOWN",
            MerchantName = t.MerchantName,
            LogoUrl = t.LogoUrl,
            PersonalFinanceCategoryIconUrl = t.PersonalFinanceCategoryIconUrl,
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
            PersonalFinanceCategory = t.PersonalFinanceCategory ?? "UNKNOWN",
            MerchantName = t.MerchantName,
            LogoUrl = t.LogoUrl,
            PersonalFinanceCategoryIconUrl = t.PersonalFinanceCategoryIconUrl,
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
            PersonalFinanceCategory = t.PersonalFinanceCategory ?? "UNKNOWN",
            MerchantName = t.MerchantName,
            LogoUrl = t.LogoUrl,
            PersonalFinanceCategoryIconUrl = t.PersonalFinanceCategoryIconUrl,
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
                 PersonalFinanceCategory as Category,
                 PersonalFinanceCategoryIconUrl as IconUrl,
                 Sum(Amount) as Expenditure,
                 (select SUM(Amount) from Transactions where Date > DATEADD(month, -1, GETDATE())) as Total
             from Transactions
             where UserId = {userId} and Date > DATEADD(month, -1, GETDATE())
             group by PersonalFinanceCategory, PersonalFinanceCategoryIconUrl
             order by Expenditure desc
             """
        ).ToListAsync();

        return results;
    }
}