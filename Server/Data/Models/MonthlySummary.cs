namespace Server.Data.Models;

public record MonthlySummary
{
    public required string MonthName { get; set; }
    
    public double Income { get; set; }
    
    public double Expenditure { get; set; }
}