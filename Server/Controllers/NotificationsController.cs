using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Server.Services;

namespace Server.Controllers;

[ApiController]
public class NotificationsController(ILogger<NotificationsController> logger, IItemsService itemsService) : ControllerBase
{
    [Route("[controller]")]
    [HttpPost]
    public async Task<IActionResult> PlaidWebhook(SyncUpdatesAvailableWebhookDto webhookData)
    {
        var updatedCount = 0;
        
        logger.LogInformation($"Received Plaid webhook: Type={webhookData.WebhookType}, Code={webhookData.WebhookCode}");

        try
        {
            updatedCount = await itemsService.UpdateItemByIdAsync(webhookData.ItemId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update item with id={ItemId}", webhookData.ItemId);
        }
        
        logger.LogInformation("Updated {transactionCount} transactions for item {itemId}", updatedCount, webhookData.ItemId);
        return Ok();
    }
}

public class SyncUpdatesAvailableWebhookDto
{
    /// <summary>
    /// The general category of the webhook.
    /// </summary>
    [JsonPropertyName("webhook_type")]
    public required string WebhookType { get; set; }

    /// <summary>
    /// The specific payload of the webhook.
    /// </summary>
    [JsonPropertyName("webhook_code")]
    public required string WebhookCode { get; set; }

    /// <summary>
    /// The environment from which this webhook was sent.
    /// </summary>
    [JsonPropertyName("environment")]
    public required string Environment { get; set; }
    
    [JsonPropertyName("item_id")]
    public required string ItemId { get; set; }
    
    [JsonPropertyName("initial_update_complete")]
    public bool InitialUpdateComplete { get; set; }
    
    [JsonPropertyName("historical_update_complete")]
    public bool HistoricalUpdateComplete { get; set; }
}