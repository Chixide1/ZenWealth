using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Requests;

public class ConfirmEmailRequest
{
    [EmailAddress]
    public required string Email { get; set; }

    public required string Token { get; set; }
}