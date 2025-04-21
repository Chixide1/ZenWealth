using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.Entities;
using Server.Data.Models;
using Server.Data.Models.Dtos;
using Server.Services;
using Server.Services.Interfaces;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
[Produces("application/json")]
public class AccountsController(
    IAccountsService accountsService,
    UserManager<User> userManager,
    ILogger<AccountsController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<AccountDto>), StatusCodes.Status200OK )]
    public async Task<IActionResult> GetAllUserAccounts()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            logger.LogWarning("Unable to retrieve user accounts - user is unauthorized");
            return Unauthorized();
        }

        logger.LogDebug("Starting accounts update for user {UserId}", user.Id);
        await accountsService.UpdateAccountsAsync(user.Id);
        
        logger.LogDebug("Retrieving accounts for user {UserId}", user.Id);
        var accounts = await accountsService.GetAccountsAsync(user.Id);
            
        return Ok(accounts);
    }
}