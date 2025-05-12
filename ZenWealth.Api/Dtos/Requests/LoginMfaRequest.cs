using System.ComponentModel.DataAnnotations;

namespace ZenWealth.Api.Dtos.Requests;

public class LoginMfaRequest
{
    [Required]
    public required string Code { get; set; }

    public bool RememberMe { get; set; }

    public bool RememberMachine { get; set; }
}