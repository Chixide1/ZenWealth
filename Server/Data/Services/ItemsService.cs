using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data.Models;
using Server.Models;

namespace Server.Data.Services;

public class ItemsService(
    AppDbContext context) : IItemsService
{
    public void Add(string accessToken, IdentityUser user)
    {
        context.Items.Add(new Item()
        {
            AccessToken = accessToken,
            User = user
        });
        
        context.SaveChanges();
    }
    
    public bool Check(IdentityUser user)
    {
        var result = context.Items
            .Include(i => i.User)
            .Any(i => i.User == user);
        
        return result;
    }
}