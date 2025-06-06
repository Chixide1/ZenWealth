﻿using Microsoft.EntityFrameworkCore;

namespace ZenWealth.Core.Models;

public class TopExpenseCategoryDto
{
    public required string Category { get; set; }
    
    [Precision(18, 2)]
    public decimal Expenditure{ get; set; }
    
    [Precision(18, 2)]
    public decimal Total { get; set; }
    
    public required string IconUrl { get; set; }
}