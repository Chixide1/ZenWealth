namespace Server.Data.DTOs;

public class TopExpenseCategoryDto
{
    public required string Category { get; set; }
    
    public decimal Expenditure{ get; set; }
    
    public decimal Total { get; set; }
    
    public required string IconUrl { get; set; }
}