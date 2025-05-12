using Microsoft.AspNetCore.Identity;

namespace ZenWealth.Api.Dtos.Responses;

internal class AuthResponse
{
    public List<IdentityError> Errors { get; } = [];
}