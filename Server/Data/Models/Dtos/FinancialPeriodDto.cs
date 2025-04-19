namespace Server.Data.Models.Dtos;

public class FinancialPeriodDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public Dictionary<string, decimal> Categories { get; set; } = new();
    public CategoriesTotals Totals { get; set; } = new();
    
    public class CategoriesTotals
    {
        public decimal Income { get; set; }
        public decimal Expenses { get; set; }
        public decimal NetProfit { get; set; }
    }
}