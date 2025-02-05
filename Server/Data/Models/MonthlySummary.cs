namespace Server.Data.Models;

public record MonthlySummary
{
    public required string Month { get; set; }
    
    public double Income { get; set; }
    
    public double Expenditure { get; set; }
}