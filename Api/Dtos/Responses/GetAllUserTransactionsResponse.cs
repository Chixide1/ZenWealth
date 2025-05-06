using Core.Models;

namespace Api.Dtos.Responses;

public record GetAllUserTransactionsResponse(
    List<TransactionDto> Transactions,
    int? NextCursor,
    DateOnly? NextDate
);