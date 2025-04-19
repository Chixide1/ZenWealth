using Microsoft.AspNetCore.Mvc;

namespace Server.Data.Models.Requests;

public class GetTransactionsRequest
{
    public int Cursor { get; set; } = 0;
    public DateOnly Date { get; set; } = new DateOnly();
    public int PageSize { get; set; } = 10;
    public string? Name { get; set; }
    public string? Sort { get; set; }
        
    [FromQuery(Name = "excludeCategories")]
    public string[]? ExcludeCategories { get; set; }
        
    [FromQuery(Name = "excludeAccounts")]
    public string[]? ExcludeAccounts { get; set; }
    public decimal? Amount { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public DateOnly? BeginDate { get; set; }
    public DateOnly? EndDate { get; set; }
}