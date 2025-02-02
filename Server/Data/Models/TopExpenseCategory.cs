namespace Server.Data.Models;

public class TopExpenseCategory
{
    public required string Category { get; set; }
    
    public double Expenditure{ get; set; }
    
    public double Total { get; set; }
    
    public required string IconUrl { get; set; }
}