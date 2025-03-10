﻿using Microsoft.AspNetCore.Identity;
using Server.Data.DTOs;
using Server.Data.Models;

namespace Server.Common;

public abstract class Responses
{
    public record GetLinkTokenResponse(string Value);

    public record ExchangePublicTokenResponse(string PublicToken, string InstitutionName);

    public record HasItemsResponse(bool HasItems, string UserName);

    public record GetAllUserTransactionsResponse(
        List<TransactionDto> Transactions,
        int? NextCursor,
        DateOnly? NextDate
    );
    
    public record GetAllUserTransactionsResponseAmount(
        List<TransactionDto> Transactions,
        int? NextCursor,
        decimal? NextAmount
    );
    
    public class AuthResponse
    {
        public List<IdentityError> Errors { get; } = [];
    }
}