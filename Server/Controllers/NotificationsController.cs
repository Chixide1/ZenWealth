using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Going.Plaid;
using Going.Plaid.Entity;
using Server.Services;
using Server.Utils;
using Environment = Going.Plaid.Environment;

namespace Server.Controllers;

[ApiController]
[Route("[controller]")]
public class NotificationsController(
    ILogger<NotificationsController> logger,
    IItemsService itemsService,
    IAccountsService accountsService,
    IEmailService emailService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> PlaidWebhook(PlaidWebhookDto webhookData)
    {
        logger.LogInformation("Received Plaid webhook: {@webhook}",
            new {Type = webhookData.WebhookType, Code = webhookData.WebhookCode, Item = webhookData.ItemId});
        
        switch (webhookData.WebhookType)
        {
            case WebhookType.Transactions:
                await HandleTransactionWebhook(webhookData);
                break;
            case WebhookType.Item:
                await HandleItemWebhook(webhookData);
                break;
            default:
                logger.LogWarning("Unknown webhook Type: {WebhookType}", webhookData.WebhookType);
                break;
        }
        
        return Ok();
    }

    private async Task HandleTransactionWebhook(PlaidWebhookDto webhookData)
    {
        try
        {
            logger.LogInformation("Processing transactions webhook: {WebhookCode} for item {ItemId}", 
                webhookData.WebhookCode, webhookData.ItemId);
                
            switch (webhookData.WebhookCode)
            {
                case WebhookCode.SyncUpdatesAvailable:
                    var transactionsAdded = await itemsService.UpdateItemByPlaidIdAsync(webhookData.ItemId);
                    logger.LogInformation("Updated item {ItemId} with {TransactionsAdded} new transactions", 
                        webhookData.ItemId, transactionsAdded);
                    break;
                    
                case WebhookCode.TransactionsRemoved:
                    // Handle removed transactions if needed
                    logger.LogInformation("Received transactions removed webhook for item {ItemId}", webhookData.ItemId);
                    logger.LogInformation("Updated item {ItemId}", 
                        webhookData.ItemId);
                    break;
                    
                case WebhookCode.InitialUpdate:
                    logger.LogInformation("Initial update complete for item {ItemId}", webhookData.ItemId);
                    await itemsService.UpdateItemByPlaidIdAsync(webhookData.ItemId);
                    break;
                    
                case WebhookCode.HistoricalUpdate:
                    logger.LogInformation("Historical update complete for item {ItemId}", webhookData.ItemId);
                    await itemsService.UpdateItemByPlaidIdAsync(webhookData.ItemId);
                    break;
                    
                case WebhookCode.DefaultUpdate:
                    logger.LogInformation("Default update triggered for item {ItemId}", webhookData.ItemId);
                    await itemsService.UpdateItemByPlaidIdAsync(webhookData.ItemId);
                    break;
                    
                default:
                    logger.LogWarning("Unhandled transactions webhook code: {WebhookCode} for item {ItemId}", 
                        webhookData.WebhookCode, webhookData.ItemId);
                    break;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing transactions webhook {WebhookCode} for item {ItemId}", 
                webhookData.WebhookCode, webhookData.ItemId);
            // Consider whether to rethrow or swallow the exception based on your error handling strategy
        }
    }
    
    private async Task HandleItemWebhook(PlaidWebhookDto webhookData)
    {
        try
        {
            logger.LogInformation("Processing item webhook: {WebhookCode} for item {ItemId}", 
                webhookData.WebhookCode, webhookData.ItemId);
                
            switch (webhookData.WebhookCode)
            {
                case WebhookCode.Error:
                    // Find the item and associated user to send them an email
                    var item = await itemsService.GetItemDetailsByPlaidIdAsync(webhookData.ItemId);
                    
                    if (item != null)
                    {
                        var errorMessage = $"We've encountered an issue with your connected account '{item.InstitutionName}'. Please reconnect it through the app to restore access to your financial data.";
                        
                        await emailService.SendEmailAsync(
                            item.UserEmail, 
                            "Action Required: ZenWealth Account Connection Issue", 
                            errorMessage);
                            
                        logger.LogInformation("Sent reconnection email to user for item {ItemId} ({InstitutionName})", 
                            webhookData.ItemId, item.InstitutionName);
                    }
                    else
                    {
                        logger.LogWarning("Item {ItemId} not found when processing error webhook", webhookData.ItemId);
                    }
                    break;
                    
                case WebhookCode.PendingExpiration:
                    // Find the item and associated user to send them an email about pending expiration
                    var expiringItem = await itemsService.GetItemDetailsByPlaidIdAsync(webhookData.ItemId);
                    if (expiringItem != null)
                    {
                        var expirationMessage = $"Your connection to '{expiringItem.InstitutionName}' will expire soon. Please reconnect your account through the app to maintain access to your financial data.";
                        
                        await emailService.SendEmailAsync(
                            expiringItem.UserEmail, 
                            "Action Required: ZenWealth Account Connection Expiring", 
                            expirationMessage);
                            
                        logger.LogInformation("Sent expiration email to user for item {ItemId} ({InstitutionName})", 
                            webhookData.ItemId, expiringItem.InstitutionName);
                    }
                    break;
                    
                case WebhookCode.UserPermissionRevoked:
                    logger.LogInformation("User permission revoked for item {ItemId}", webhookData.ItemId);
                    // Handle permission revocation - perhaps delete the item from your database
                    break;
                    
                case WebhookCode.NewAccountsAvailable:
                    logger.LogInformation("New accounts available for item {ItemId}", webhookData.ItemId);
                    await accountsService.UpdateAccountsByPlaidItemIdAsync(webhookData.ItemId);
                    break;
                    
                case WebhookCode.WebhookUpdateAcknowledged:
                    logger.LogInformation("Webhook update acknowledged for item {ItemId}", webhookData.ItemId);
                    break;
                    
                default:
                    logger.LogWarning("Unhandled item webhook code: {WebhookCode} for item {ItemId}", 
                        webhookData.WebhookCode, webhookData.ItemId);
                    break;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing item webhook {WebhookCode} for item {ItemId}", 
                webhookData.WebhookCode, webhookData.ItemId);
        }
    }
}

public class PlaidWebhookDto
{
    /// <summary>
    /// The general category of the webhook.
    /// </summary>
    [JsonPropertyName("webhook_type")]
    public required WebhookType WebhookType { get; set; }

    /// <summary>
    /// The specific payload of the webhook.
    /// </summary>
    [JsonPropertyName("webhook_code")]
    public required WebhookCode WebhookCode { get; set; }

    /// <summary>
    /// The environment from which this webhook was sent.
    /// </summary>
    [JsonPropertyName("environment")]
    public Environment Environment { get; set; }
    
    [JsonPropertyName("item_id")]
    public required string ItemId { get; set; }
    
}