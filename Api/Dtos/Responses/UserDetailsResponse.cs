using Core.Models;

namespace Api.Dtos.Responses;

public record UserDetailsResponse(string UserName, string Email, IEnumerable<InstitutionDto> Institutions);