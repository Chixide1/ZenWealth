namespace Server.Data.Models;

public record MonthlySummary
{
    public required string MonthName { get; set; }
    
    public Double Income { get; set; }
    
    public Double Expenditure { get; set; }
}