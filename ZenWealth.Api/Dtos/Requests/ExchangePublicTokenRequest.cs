namespace ZenWealth.Api.Dtos.Requests;

public record ExchangePublicTokenRequest(string PublicToken, string InstitutionName, string InstitutionId);