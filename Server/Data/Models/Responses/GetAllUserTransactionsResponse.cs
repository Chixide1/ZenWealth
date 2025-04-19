using Server.Data.Models.Dtos;

namespace Server.Data.Models.Responses;

public record GetAllUserTransactionsResponse(
    List<TransactionDto> Transactions,
    int? NextCursor,
    DateOnly? NextDate
);