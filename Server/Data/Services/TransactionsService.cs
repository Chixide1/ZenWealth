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
    /// <param name="cursor">Used for pagination</param>
    /// <param name="pageSize">The amount of results returned</param>
    /// <returns>A task representing the asynchronous operation, containing a list of stripped transactions for the user.</returns>
    public async Task<List<TransactionDto>> GetUserTransactionsAsync(string userId, int cursor = 1, int pageSize = 10)
    {
        var transactions = await context.Transactions
            .Where(t => t.UserId == userId && t.Id >= cursor)
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
            .Take(pageSize + 1)
            .ToListAsync();

        logger.LogInformation("Retrieved {TransactionCount} transactions for user {UserId}", transactions.Count,
            userId);

        return transactions;
    }

    /// <summary>
    /// Asynchronously retrieves the total income and outcome for a specified user in each of the last 12 months.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose transactions are to be retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing a list of monthly expenditure data.</returns>
    public async Task<List<MonthlySummary>> MonthlyIncomeAndOutcome(string userId)
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
                 WHERE  UserId = '4f927d76-82d7-4c01-97bd-03600c99818f' AND Date > DATEADD(Year, -1, GETDATE())
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
}