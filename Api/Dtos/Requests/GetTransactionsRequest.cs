using Core.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Api.Dtos.Requests;

public class GetTransactionsRequest : TransactionParams
{
    [FromQuery(Name = "excludeCategories")]
    public override string[]? ExcludeCategories { get; set; }
        
    [FromQuery(Name = "excludeAccounts")]
    public override string[]? ExcludeAccounts { get; set; }
}