using Microsoft.AspNetCore.Identity;

namespace Server.Data.Models;

public class User : IdentityUser
{
    public List<Item> Items { get; } = [];
    
    public List<Account> Accounts { get; } = [];
    
    public List<Transaction> Transactions { get; } = [];
}