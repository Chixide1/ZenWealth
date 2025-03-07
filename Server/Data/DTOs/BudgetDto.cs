namespace Server.Data.DTOs;

public class BudgetDto
{
    /// <summary>
    /// <para>Unique ID for each Budget</para>
    /// </summary>
    public int Id { get; init; }
    
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
    
    /// <summary>
    /// <para>The amount that has been spent belonging to that category for the time period</para>
    /// </summary>
    public required decimal Spent { get; init; }
    
    /// <summary>
    /// <para>The amount remaining before the budget limit is reached</para>
    /// </summary>
    public required decimal Remaining { get; init; }
}