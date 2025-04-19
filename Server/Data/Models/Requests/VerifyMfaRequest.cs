using System.ComponentModel.DataAnnotations;

namespace Server.Data.Models.Requests;

public class VerifyMfaRequest
{
    [Required]
    [StringLength(7, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Text)]
    public required string Code { get; set; }
}