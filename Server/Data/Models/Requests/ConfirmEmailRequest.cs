using System.ComponentModel.DataAnnotations;

namespace Server.Data.Models.Requests;

public class ConfirmEmailRequest
{
    [EmailAddress]
    public required string Email { get; set; }

    public required string Token { get; set; }
}