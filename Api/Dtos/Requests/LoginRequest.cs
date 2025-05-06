using System.ComponentModel.DataAnnotations;

namespace Api.Dtos.Requests;

public class LoginRequest
{
    [Required(ErrorMessage = "Username is required")]
    public required string Username { get; init; }
    
    [Required(ErrorMessage = "Password is required")]
    public required string Password { get; init; }
    public bool RememberMe { get; init; }
}