namespace Server.Data.Models.Requests;

public record ExchangePublicTokenRequest(string PublicToken, string InstitutionName, string InstitutionId);