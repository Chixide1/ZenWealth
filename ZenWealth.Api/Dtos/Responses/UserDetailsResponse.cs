using ZenWealth.Core.Models;

namespace ZenWealth.Api.Dtos.Responses;

public record UserDetailsResponse(string UserName, string Email, IEnumerable<InstitutionDto> Institutions);