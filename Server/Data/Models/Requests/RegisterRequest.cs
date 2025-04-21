using System.ComponentModel.DataAnnotations;

namespace Server.Data.Models.Requests;

public class RegisterRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public required string Email { get; set; }
    
    [Required(ErrorMessage = "Username is required")]
    [MinLength(1, ErrorMessage = "Username cannot be empty")]
    public required string Username { get; set; }
    
    [DataType(DataType.Password)]
    public required string Password { get; set; }
}