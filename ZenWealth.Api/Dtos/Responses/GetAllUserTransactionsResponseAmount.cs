using ZenWealth.Core.Models;

namespace ZenWealth.Api.Dtos.Responses;

public record GetAllUserTransactionsResponseAmount(
    List<TransactionDto> Transactions,
    int? NextCursor,
    decimal? NextAmount
);