namespace Server.Data.Models;

public class TopExpenseCategory
{
    public required string Category { get; set; }
    
    public decimal Expenditure{ get; set; }
    
    public decimal Total { get; set; }
    
    public required string IconUrl { get; set; }
}