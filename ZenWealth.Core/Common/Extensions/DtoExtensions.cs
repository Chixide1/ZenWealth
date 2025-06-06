using Microsoft.EntityFrameworkCore;
using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Models;

namespace ZenWealth.Core.Utils.Extensions;

public static class DtoExtensions
{
    /// <summary>
    /// Convert Transactions into Transaction Data Transfer Object
    /// </summary>
    /// <param name="transaction">The Transaction IQueryable to be transformed.</param>
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