using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Server.Models;

public class Item
{
    /// <summary>
    /// <para>Unique ID for each Item</para>
    /// </summary>
    public int Id { get; init; }
    
    /// <summary>
    /// <para>The associated User account</para>
    /// </summary>
    [Required]
    [ForeignKey(nameof(IdentityUser))]
    public IdentityUser? User { get; set; }
    
    /// <summary>
    /// <para>The token which allows interaction with the user's bank to retrieve transaction information</para>
    /// </summary>
    [Column(TypeName = "varchar(100)")]
    public required string AccessToken { get; init; }
    
    /// <summary>
    /// <para>Navigation property for Accounts associated with this Item</para>
    /// </summary>
    public List<Account>? Accounts { get; set; }
}