using Server.Data.Models;
using Server.Data.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Server.Extensions;

public static class DtoExtensions
{
    /// <summary>
    /// Convert Transactions into Transaction Data Transfer Object
    /// </summary>
    /// <remarks>
    /// This extension method selects only the necessary fields from the table through LINQ to be returned to the frontend 
    /// </remarks>
    /// <param name="transaction">The Transaction IQueryable</param>
    public static IQueryable<TransactionDto> ToTransactionDto(this IQueryable<Transaction> transaction)
    {
        var transactionDto = transaction
            .Include(t => t.Account)
            .Select(t => new TransactionDto()
            {
                Id = t.Id,
                Name = t.Name,
                AccountName = t.Account.Name,
                Amount = t.Amount,
                Date = t.Date,
                Datetime = t.Datetime,
                IsoCurrencyCode = t.IsoCurrencyCode ?? t.UnofficialCurrencyCode ?? "GBP",
                Category = t.Category ?? "UNKNOWN",
                LogoUrl = t.LogoUrl,
                CategoryIconUrl = t.CategoryIconUrl,
            });
        
        return transactionDto;
    }    
}