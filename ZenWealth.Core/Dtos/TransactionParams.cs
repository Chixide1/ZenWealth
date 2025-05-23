﻿using ZenWealth.Core.Domain.Constants;

namespace ZenWealth.Core.Dtos;

public class TransactionParams
{
    public int Cursor { get; set; } = 0;
    public DateOnly Date { get; set; } = new DateOnly();
    public int PageSize { get; init; } = 10;
    public string? Name { get; set; }
    public TransactionSortOption Sort { get; init; }
    public virtual string[]? ExcludeCategories { get; set; }
    public virtual string[]? ExcludeAccounts { get; set; }
    public decimal? Amount { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public DateOnly? BeginDate { get; set; }
    public DateOnly? EndDate { get; set; }
}