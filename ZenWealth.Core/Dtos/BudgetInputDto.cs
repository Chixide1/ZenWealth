namespace ZenWealth.Core.Models;

public class BudgetInputDto
{
    /// <summary>
    /// <para>The category which the budget is set for</para>
    /// </summary>
    public required string Category { get; init; }
    
    /// <summary>
    /// <para>The budget limit which the amount shouldn't exceed</para>
    /// </summary>
    public required decimal Limit { get; init; }

    /// <summary>
    /// <para>The day that the budget will start / reset</para>
    /// </summary>
    public required int Day { get; init; }
}