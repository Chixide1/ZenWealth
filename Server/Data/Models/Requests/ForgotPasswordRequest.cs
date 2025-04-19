using System.ComponentModel.DataAnnotations;

namespace Server.Data.Models.Requests;

public class ForgotPasswordRequest
{
    [EmailAddress]
    public required string Email { get; set; }
}