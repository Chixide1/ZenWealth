using Microsoft.AspNetCore.Identity;

namespace Api.Dtos.Responses;

public record DeleteUserResponse(bool Success, IEnumerable<IdentityError> Errors)
{
    public override string ToString()
    {
        return $"{{ Success = {Success}, Errors = {Errors} }}";
    }
}