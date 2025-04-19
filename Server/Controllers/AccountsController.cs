using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
    UserManager<User> userManager) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<AccountDto>), StatusCodes.Status200OK )]
    public async Task<IActionResult> GetAllUserAccounts()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        await accountsService.UpdateAccountsAsync(user.Id);
        
        var accounts = await accountsService.GetAccountsAsync(user.Id);
            
        return Ok(accounts);
    }
}