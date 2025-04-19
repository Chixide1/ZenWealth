using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Server.Data.Models;
using Server.Data.Models.Params;
using Server.Data.Models.Requests;
using Server.Data.Models.Responses;
using Server.Services;
using Server.Services.Interfaces;
using Account = Going.Plaid.Entity.Account;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
[Produces("application/json")]
public class LinkController(
    ILogger<LinkController> logger,
    IItemsService itemsService,
    UserManager<User> userManager) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetLinkTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetLinkToken()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var result = await itemsService.CreateLinkTokenAsync(user.Id);
        
        if (!result.IsSuccess)
        {
            logger.LogError("Failed to get link token: {ErrorMessage}", result.ErrorMessage);
            return BadRequest(new { Error = result.ErrorMessage });
        }
        
        logger.LogInformation("Successfully obtained link token for user {UserId}", user.Id);
        return Ok(new GetLinkTokenResponse(result.LinkToken!));
    }

    [HttpGet("{itemId:int}")]
    [ProducesResponseType(typeof(GetLinkTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUpdateLinkToken(int itemId)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var result = await itemsService.CreateUpdateLinkTokenAsync(user.Id, itemId);
        
        if (!result.IsSuccess)
        {
            if (result.ErrorMessage?.Contains("not found") == true)
            {
                return NotFound(new { Error = result.ErrorMessage });
            }
            
            logger.LogError("Failed to get update link token: {ErrorMessage}", result.ErrorMessage);
            return BadRequest(new { Error = result.ErrorMessage });
        }
        
        logger.LogInformation("Successfully obtained update link token for user {UserId} and item {ItemId}", user.Id, itemId);
        return Ok(new GetLinkTokenResponse(result.LinkToken!));
    }
    
    [HttpPut("{itemId:int}")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateItemReauthentication(int itemId, [FromBody] UpdateItemReauthRequest request)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var result = await itemsService.ExchangePublicTokenForReauthAsync(new ReauthParams
        (
            PublicToken: request.PublicToken,
            ItemId: itemId,
            UserId: user.Id,
            Accounts: request.Accounts
            
        ));
        
        if (!result.IsSuccess)
        {
            logger.LogError("Failed to update item authentication for item {ItemId} & user {UserId}: {ErrorMessage}",
                itemId, user.Id, result.Error?.ErrorMessage);
                
            return BadRequest(new { 
                message = $"Failed to update authentication for item {itemId}",
                error = result.Error?.ErrorMessage
            });
        }
        
        logger.LogInformation("Successfully updated authentication for user {UserId} and item {ItemId}", user.Id, itemId);
        return Ok(new { success = true });
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ExchangePublicToken([FromBody] ExchangePublicTokenRequest data)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
    
        var result = await itemsService.ExchangePublicTokenAsync(data.PublicToken, data.InstitutionName, data.InstitutionId, user.Id);
    
        if (!result.IsSuccess)
        {
            logger.LogError("Failed to exchange public token: {ErrorMessage}", result.Error?.ErrorMessage);
        
            // Handle the specific duplicate institution error
            if (result.Error?.ErrorCode == "INSTITUTION_ALREADY_LINKED")
            {
                return Conflict(new { 
                    Error = result.Error.ErrorMessage,
                    ErrorCode = result.Error.ErrorCode
                });
            }
        
            return BadRequest(new { 
                Error = result.Error?.ErrorMessage ?? "Failed to exchange public token",
                ErrorCode = result.Error?.ErrorCode
            });
        }
    
        return Ok(new { result.AddedTransactions });
    }

    [HttpDelete("{itemId:int}")]
    [ProducesResponseType(type: typeof(DeleteItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(type: typeof(DeleteItemResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteItem(int itemId)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var success = await itemsService.DeleteItemAsync(user.Id, itemId);
        
        if (!success)
        {
            return NotFound(new DeleteItemResponse(false, "Item not found or could not be deleted"));
        }
        
        return Ok(new DeleteItemResponse(Success: true));
    }
}