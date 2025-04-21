using Server.Data.Models.Dtos;

namespace Server.Data.Models.Responses;

public record UserDetailsResponse(string UserName, string Email, IEnumerable<InstitutionDto> Institutions);