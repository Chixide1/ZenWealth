using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Server.Models;

public class Item
{
    public int Id { get; set; }
    
    [Column("UserId")]
    [ForeignKey(nameof(IdentityUser))]
    public required IdentityUser User { get; set; }
    
    [Column(TypeName = "varchar(100)")]
    public required string AccessToken { get; set; }
}