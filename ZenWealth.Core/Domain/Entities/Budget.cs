namespace ZenWealth.Core.Domain.Entities;

public class Budget
{
    /// <summary>
    /// <para>Unique ID for each Budget</para>
    /// </summary>
    public int Id { get; init; }
    
    /// <summary>
    /// <para>The associated user ID</para>
    /// </summary>
    public required string UserId { get; init; }
    
    /// <summary>
    /// <para>The associated user's Navigation</para>
    /// </summary>
    public User User { get; init; } = null!;
    
    /// <summary>
    /// <para>The category which the budget is set for</para>
    /// </summary>
    public required string Category { get; init; }
    
    /// <summary>
    /// <para>The budget limit which the amount shouldn't exceed</para>
    /// </summary>
    public required decimal Limit { get; set; }

    /// <summary>
    /// <para>The day that the budget will start / reset</para>
    /// </summary>
    public required int Day { get; set; }
}