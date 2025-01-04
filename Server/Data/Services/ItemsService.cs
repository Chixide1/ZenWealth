using Server.Data.Models;

namespace Server.Data.Services;

public class ItemsService(
    AppDbContext context,
    ILogger<ItemsService> logger) : IItemsService
{
    public void Add(string accessToken, string userId)
    {
        context.Items.Add(new Item()
        {
            AccessToken = accessToken,
            UserId = userId
        });
        
        context.SaveChanges();
        
        logger.LogInformation("Added item for user {UserId}", userId);
    }
    
    public bool Check(string userId)
    {
        var result = context.Items.Any(i => i.UserId == userId);
        logger.LogInformation("Checked if user {UserId} has an item", userId);
        
        return result;
    }
}