namespace Server.Data.Models;

public record MonthlySummary
{
    public required string Month { get; set; }
    
    public decimal Income { get; set; }
    
    public decimal Expenditure { get; set; }
}