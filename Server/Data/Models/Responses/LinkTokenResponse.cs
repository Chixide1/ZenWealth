using Going.Plaid.Entity;

namespace Server.Data.Models.Responses;

/// <summary>
/// Represents the result of creating a link token
/// </summary>
public class LinkTokenResponse
{
    public bool IsSuccess { get; set; }
    public string? LinkToken { get; set; }
    public string? ErrorMessage { get; set; }
    public PlaidError? PlaidError { get; set; }
    
    public static LinkTokenResponse Success(string linkToken) => 
        new() { IsSuccess = true, LinkToken = linkToken };
    
    public static LinkTokenResponse Failure(string errorMessage, PlaidError? plaidError = null) => 
        new() { IsSuccess = false, ErrorMessage = errorMessage, PlaidError = plaidError };
}