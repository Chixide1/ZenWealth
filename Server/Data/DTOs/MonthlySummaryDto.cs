namespace Server.Data.DTOs;

public record MonthlySummaryDto
{
    public required string Month { get; set; }
    
    public decimal Income { get; set; }
    
    public decimal Expenditure { get; set; }
}