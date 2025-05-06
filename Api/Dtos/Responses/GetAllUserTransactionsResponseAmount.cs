using Core.Models;

namespace Api.Dtos.Responses;

public record GetAllUserTransactionsResponseAmount(
    List<TransactionDto> Transactions,
    int? NextCursor,
    decimal? NextAmount
);