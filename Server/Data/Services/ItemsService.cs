using Server.Data.Models;

namespace Server.Data.Services;

/// <summary>
/// The Service where the business logic for Items is implemented.
/// Also used as the Data Access Layer.
/// </summary>
public class ItemsService(
    AppDbContext context,
    ILogger<ItemsService> logger) : IItemsService
{
    /// <summary>
    /// Adds a new item to the database for the given user.
    /// </summary>
    /// <param name="accessToken">The access token for the item.</param>
    /// <param name="userId">The user ID of the user that the item belongs to.</param>
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
    
    /// <summary>
    /// Checks if a user has an item.
    /// </summary>
    /// <param name="userId">The ID of the user to check.</param>
    /// <returns>True if the user has an item, false otherwise.</returns>
    public bool Check(string userId)
    {
        var result = context.Items.Any(i => i.UserId == userId);
        logger.LogInformation("Checked if user {UserId} has an item", userId);
        
        return result;
    }
}