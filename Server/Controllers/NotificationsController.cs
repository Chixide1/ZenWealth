using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Webhook;
using Microsoft.Extensions.Options;
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
    public async Task<IActionResult> PlaidWebhook(WebhookBase webhookData)
    {
        logger.LogInformation("Received Plaid webhook: {@Webhook}",
            new {Type = webhookData.WebhookType, Code = webhookData.WebhookCode});
        
        switch (webhookData.WebhookType)
        {
            case WebhookType.Transactions:
                await HandleTransactionWebhook(webhookData);
                break;
            case WebhookType.Item:
                await HandleItemWebhook(webhookData);
                break;
            default:
                logger.LogWarning("Unprocessed webhook Type: {WebhookType}", webhookData.WebhookType);
                break;
        }
        
        return Ok();
    }

    private async Task HandleTransactionWebhook(WebhookBase webhookData)
    {
        switch (webhookData)
        {
            case SyncUpdatesAvailableWebhook webhook:
                var transactionsAdded = await itemsService.UpdateItemByPlaidIdAsync(webhook.ItemId);
                logger.LogInformation("Updated item {PlaidItemId} with {TransactionsAdded} new transactions", 
                    webhook.ItemId, transactionsAdded);
                break;
                
            case TransactionsRemovedWebhook webhook:
                // Handle removed transactions if needed
                logger.LogInformation("Received transactions removed webhook for item {PlaidItemId}", webhook.ItemId);
                logger.LogInformation("Updated item {PlaidItemId}", 
                    webhook.ItemId);
                break;
                
            case InitialUpdateWebhook webhook:
                logger.LogInformation("Initial update complete for item {PlaidItemId}", webhook.ItemId);
                await itemsService.UpdateItemByPlaidIdAsync(webhook.ItemId);
                break;
                
            case HistoricalUpdateWebhook webhook:
                logger.LogInformation("Historical update complete for item {PlaidItemId}", webhook.ItemId);
                await itemsService.UpdateItemByPlaidIdAsync(webhook.ItemId);
                break;
                
            case DefaultUpdateWebhook webhook:
                logger.LogInformation("Default update triggered for item {PlaidItemId}", webhook.ItemId);
                await itemsService.UpdateItemByPlaidIdAsync(webhook.ItemId);
                break;
                
            default:
                logger.LogWarning("Unhandled transactions webhook code: {WebhookCode}", webhookData.WebhookCode);
                break;
        }
    }
    
    private async Task HandleItemWebhook(WebhookBase webhookData)
    {
        switch (webhookData)
        {
            case ItemErrorWebhook webhook:
                // Find the item and associated user to send them an email
                var item = await itemsService.GetItemDetailsByPlaidIdAsync(webhook.ItemId);
                
                logger.LogWarning("Item Webhook Error for Item {PlaidItemId} with error: {@Error}", webhook.ItemId, webhook.Error);
                
                if (item != null)
                {
                    var errorMessage = $"We've encountered an issue with your connected account '{item.InstitutionName}'. Please reconnect it through the app to restore access to your financial data.";
                    
                    await emailService.SendEmailAsync(
                        item.UserEmail, 
                        "Action Required: ZenWealth Account Connection Issue", 
                        errorMessage);
                        
                    logger.LogInformation("Sent reconnection email to user for item {PlaidItemId} ({InstitutionName})", 
                        webhook.ItemId, item.InstitutionName);
                }
                else
                {
                    logger.LogWarning("Item {PlaidItemId} not found when processing error webhook", webhook.ItemId);
                }
                break;
                
            case PendingExpirationWebhook webhook:
                // Find the item and associated user to send them an email about pending expiration
                logger.LogWarning("Item {PlaidItemId} is about to expire at {ItemExpirationTime}", webhook.ItemId, webhook.ConsentExpirationTime);
                
                var expiringItem = await itemsService.GetItemDetailsByPlaidIdAsync(webhook.ItemId);
                
                if (expiringItem != null)
                {
                    var expirationMessage = $"Your connection to '{expiringItem.InstitutionName}' will expire soon. Please reconnect your account through the app to maintain access to your financial data.";
                    
                    await emailService.SendEmailAsync(
                        expiringItem.UserEmail, 
                        "Action Required: ZenWealth Account Connection Expiring", 
                        expirationMessage);
                        
                    logger.LogInformation("Sent expiration email to user for item {PlaidItemId} ({InstitutionName})", 
                        webhook.ItemId, expiringItem.InstitutionName);
                }
                break;
            
            case PendingDisconnectWebhook webhook:
                // Find the item and associated user to send them an email about pending expiration
                logger.LogWarning("Item {PlaidItemId} is about to expire because of {DisconnectReason}", webhook.ItemId, webhook.Reason);
                
                var disconnectedItem = await itemsService.GetItemDetailsByPlaidIdAsync(webhook.ItemId);
                
                if (disconnectedItem != null)
                {
                    var expirationMessage = $@"
                        <p>Your connection to '{disconnectedItem.InstitutionName}' will expire soon.</p> 
                        <p>Please reconnect your account through the <a href='{emailService.Options.FrontendBaseUrl}'>ZenWealth App</a> 
                        to maintain access to your financial data.</p>
                    ";
                    
                    await emailService.SendEmailAsync(
                        disconnectedItem.UserEmail, 
                        "Action Required: ZenWealth Account Connection Expiring", 
                        expirationMessage);
                        
                    logger.LogInformation("Sent Disconnection email to user for item {PlaidItemId} ({InstitutionName})", 
                        webhook.ItemId, disconnectedItem.InstitutionName);
                }
                break;
                
            case UserPermissionRevokedWebhook webhook:
                logger.LogInformation("User permission revoked for item {PlaidItemId}", webhook.ItemId);
                await itemsService.DeleteItemByPlaidItemIdAsync(webhook.ItemId);
                break;
                
            case NewAccountsAvailableWebhook webhook:
                logger.LogInformation("New accounts available for item {PlaidItemId}", webhook.ItemId);
                await accountsService.UpdateAccountsByPlaidItemIdAsync(webhook.ItemId ?? "");
                break;
                
            case WebhookUpdateAcknowledgedWebhook webhook:
                logger.LogInformation("The Webhook URL for item {PlaidItemId} has been changed to {WebhookUrl}",
                    webhook.ItemId, webhook.NewWebhookUrl);
                break;
                
            default:
                logger.LogWarning("Unhandled item webhook code: {WebhookCode}", webhookData.WebhookCode);
                break;
        }
    }
}