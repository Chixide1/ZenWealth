using Server.Data.Models.Dtos;

namespace Server.Data.Models.Responses;

public record GetAllUserTransactionsResponseAmount(
    List<TransactionDto> Transactions,
    int? NextCursor,
    decimal? NextAmount
);