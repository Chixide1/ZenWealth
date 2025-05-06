using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class Budget
{
    /// <summary>
    /// <para>Unique ID for each Budget</para>
    /// </summary>
    public int Id { get; init; }
    
    /// <summary>
    /// <para>The associated user ID</para>
    /// </summary>
    [Column(TypeName = "nvarchar(450)")]
    public required string UserId { get; init; }
    
    /// <summary>
    /// <para>The associated user's Navigation</para>
    /// </summary>
    public User User { get; init; } = null!;
    
    /// <summary>
    /// <para>The category which the budget is set for</para>
    /// </summary>
    [Column(TypeName = "varchar(255)")]
    public required string Category { get; init; }
    
    /// <summary>
    /// <para>The budget limit which the amount shouldn't exceed</para>
    /// </summary>
    [Column(TypeName = "decimal(10, 2)")]
    public required decimal Limit { get; set; }

    /// <summary>
    /// <para>The day that the budget will start / reset</para>
    /// </summary>
    public required int Day { get; set; }
}