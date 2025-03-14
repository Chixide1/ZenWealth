namespace Server.Data.DTOs;

public class CategorySummary
{
    public string Category { get; set; } = string.Empty;
    public decimal Total { get; init; }
}