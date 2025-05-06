using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Requests;

public class ResetPasswordRequest
{
    [EmailAddress]
    public required string Email { get; set; }

    public required string Token { get; set; }

    [StringLength(100, MinimumLength = 6)]
    public required string NewPassword { get; set; }

    [Compare("NewPassword")]
    public required string ConfirmPassword { get; set; }
}