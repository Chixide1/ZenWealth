using ZenWealth.Core.Models;

namespace ZenWealth.Api.Dtos.Responses;

public record GetAllUserTransactionsResponse(
    List<TransactionDto> Transactions,
    int? NextCursor,
    DateOnly? NextDate
);