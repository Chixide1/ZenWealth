using Microsoft.AspNetCore.Identity;

namespace Server.Data.Models.Responses;

internal class AuthResponse
{
    public List<IdentityError> Errors { get; } = [];
}