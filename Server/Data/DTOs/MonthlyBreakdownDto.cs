namespace Server.Data.DTOs;

public class MonthlyBreakdownDto
{
    public int Year { get; set; }
    
    public int Month { get; set; }
    
    public required string Type { get; set; }
    
    public required string Category { get; set; }
    
    public decimal Total { get; set; }
}