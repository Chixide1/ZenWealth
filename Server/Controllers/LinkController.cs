﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Microsoft.AspNetCore.Identity;
using Server.Common;
using Server.Data;
using Server.Data.Services;
using Server.Utils;
using Item = Server.Data.Models.Item;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Route("[controller]/[action]")]
[Produces("application/json")]
[ProducesResponseType(typeof(PlaidError), StatusCodes.Status400BadRequest)]
public class LinkController(
    ILogger<LinkController> logger,
    PlaidClient client,
    IItemsService itemsService,
    UserManager<IdentityUser> userManager) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(Responses.GetLinkTokenResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var response = await client.LinkTokenCreateAsync(new LinkTokenCreateRequest()
        {
            User = new LinkTokenCreateRequestUser
            {
                ClientUserId = user.Id,
            },
            ClientName = "ZenWealth",
            Products = [Products.Transactions],
            Language = Language.English,
            CountryCodes = [CountryCode.Gb],
            // EnableMultiItemLink = true
        });

        if (response.Error != null)
        {
            return PlaidApiError(response.Error);
        }

        logger.LogInformation("Successfully obtained link token: {token}", response.LinkToken);
        return Ok(new Responses.GetLinkTokenResponse(response.LinkToken));
    }


    [HttpPost]
    [ProducesResponseType( StatusCodes.Status200OK)]
    public async Task<IActionResult> Exchange([FromBody] Responses.ExchangePublicTokenResponse data)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var response = await client.ItemPublicTokenExchangeAsync(new ItemPublicTokenExchangeRequest()
        {
            PublicToken = data.PublicToken
        });

        if (response.Error != null)
        {
            return PlaidApiError(response.Error);
        }
                
        itemsService.Add(response.AccessToken, user);
            
        return Ok(response);
    }
    
    [ApiExplorerSettings(IgnoreApi = true)]
    private IActionResult PlaidApiError(PlaidError error)
    {
        logger.LogError(
            "Error Type - {ErrorType}\n" +
            "Error Code - {ErrorCode}\n" +
            "Error Message - {ErrorMessage}",
            error.ErrorType,
            error.ErrorCode,
            error.ErrorMessage);
            
        return StatusCode(StatusCodes.Status400BadRequest, error);
    }
}