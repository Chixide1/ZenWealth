using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Requests;

public class ForgotPasswordRequest
{
    [EmailAddress]
    public required string Email { get; set; }
}