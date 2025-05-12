namespace ZenWealth.Core.Models;

public class ItemDetailsDto
{
    public int Id { get; set; }
    public string PlaidItemId { get; set; } = string.Empty;
    public string InstitutionName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
}