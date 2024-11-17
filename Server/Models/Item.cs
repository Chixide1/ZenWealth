using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Server.Models;

public class Item
{
    public int Id { get; set; }
    
    [Required]
    [Column("UserId")]
    [ForeignKey(nameof(IdentityUser))]
    public IdentityUser? User { get; set; }
    
    [Required]
    [Column(TypeName = "varchar(100)")]
    public string? AccessToken { get; set; }
}