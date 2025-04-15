using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Going.Plaid.Entity;
using Server.Services;
using Server.Utils;

namespace Server.Controllers;

[ApiController]
[Route("[controller]")]
public class NotificationsController(ILogger<NotificationsController> logger, IItemsService itemsService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> PlaidWebhook(PlaidWebhookDto webhookData)
    {
        logger.LogInformation("Received Plaid webhook: Type={WebhookType}, Code={WebhookCode}",
            webhookData.WebhookType, webhookData.WebhookCode);

        var webhookCodeEnum = PlaidUtil.ParseWebhookCode(webhookData.WebhookCode);
        
        switch (webhookCodeEnum)
        {
            case WebhookCode.SyncUpdatesAvailable:
                logger.LogInformation("Received Plaid sync updates available");
                await itemsService.UpdateItemByIdAsync(webhookData.ItemId);
                break;
            default:
                logger.LogWarning("Unknown webhook code: {WebhookCode}", webhookData.WebhookCode);
                break;
        }
        
        return Ok();
    }
}

public class PlaidWebhookDto
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