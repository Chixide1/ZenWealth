using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Domain.Entities;

public class Item
{
    /// <summary>
    /// <para>Unique ID for each Item</para>
    /// </summary>
    public int Id { get; init; }
    
    /// <summary>
    /// <para>The associated User ID</para>
    /// </summary>
    [Column(TypeName = "nvarchar(450)")]
    public required string UserId { get; init; }
    
    /// <summary>
    /// <para>The Plaid Item ID</para>
    /// </summary>
    [Column(TypeName = "varchar(150)")]
    public required string PlaidItemId { get; init; }

    /// <summary>
    /// <para>The associated User's Navigation</para>
    /// </summary>
    public User User { get; init; } = null!;
    
    /// <summary>
    /// <para>The token which allows interaction with the user's bank to retrieve transaction information</para>
    /// </summary>
    [Column(TypeName = "varchar(100)")]
    public required string AccessToken { get; set; }

    /// <summary>
    /// <para>Cursor used for fetching any future updates after the latest update provided in this response. The cursor obtained after all pages have been pulled (indicated by <c>has_more</c> being <c>false</c>) will be valid for at least 1 year. This cursor should be persisted for later calls. If transactions are not yet available, this will be an empty string.</para>
    /// </summary>
    [Column(TypeName = "varchar(255)")]
    public string? Cursor { get; set; }

    //<summary>
    //<para>The time of the most recent sync for this Item</para>
    //</summary>
    public DateTimeOffset? LastFetched { get; set; }
    
    /// <summary>
    /// <para>The Institution Name</para>
    /// </summary>
    [Column(TypeName = "varchar(255)")]
    public required string InstitutionName { get; init; }
    
    /// <summary>
    /// <para>The Institution ID which can be used for comparison</para>
    /// </summary>
    public required string InstitutionId { get; init; }
    
    /// <summary>
    /// <para>Navigation property for Accounts associated with this Item</para>
    /// </summary>
    public List<Account> Accounts { get; } = [];
}