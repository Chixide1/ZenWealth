using Microsoft.EntityFrameworkCore;

namespace ZenWealth.Core.Models;

public class MonthlySummaryDto
{
    public required string Month { get; set; }
    
    [Precision(18, 2)]
    public decimal Income { get; set; }
    
    [Precision(18, 2)]
    public decimal Expenditure { get; set; }
}