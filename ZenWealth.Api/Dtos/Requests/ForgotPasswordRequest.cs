using System.ComponentModel.DataAnnotations;

namespace ZenWealth.Api.Dtos.Requests;

public class ForgotPasswordRequest
{
    [EmailAddress]
    public required string Email { get; set; }
}