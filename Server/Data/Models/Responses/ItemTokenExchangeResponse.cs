using Going.Plaid.Entity;

namespace Server.Data.Models.Responses;

/// <summary>
/// Represents the result of exchanging a public token
/// </summary>
public class ItemTokenExchangeResponse
{
    public bool IsSuccess { get; set; }
    public PlaidError? Error { get; set; }
    public int AddedTransactions { get; set; }
    
    public static ItemTokenExchangeResponse Success(int addedTransactions) => 
        new() { IsSuccess = true, AddedTransactions = addedTransactions };
    
    public static ItemTokenExchangeResponse Failure(PlaidError error) => 
        new() { IsSuccess = false, Error = error };
}