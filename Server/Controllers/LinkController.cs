using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Server.Data.Models;
using Server.Services;

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

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ExchangePublicToken([FromBody] ExchangePublicTokenResponse data)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var result = await itemsService.ExchangePublicTokenAsync(data.PublicToken, data.InstitutionName, user.Id);
        
        if (!result.IsSuccess)
        {
            logger.LogError("Failed to exchange public token: {ErrorMessage}", result.Error?.ErrorMessage);
            return BadRequest(new { Error = result.Error?.ErrorMessage ?? "Failed to exchange public token" });
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

public record DeleteItemResponse(bool Success, string? Error = null)
{
    public override string ToString()
    {
        return $"{{ Success = {Success}, Error = {Error} }}";
    }
}

public record GetLinkTokenResponse(string Value);

public record ExchangePublicTokenResponse(string PublicToken, string InstitutionName);