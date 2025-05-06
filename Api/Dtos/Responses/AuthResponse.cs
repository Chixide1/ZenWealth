using Microsoft.AspNetCore.Identity;

namespace Api.Dtos.Responses;

internal class AuthResponse
{
    public List<IdentityError> Errors { get; } = [];
}