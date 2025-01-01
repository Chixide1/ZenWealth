using Going.Plaid.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.Services;
using Server.Models;
using Server.Utils;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Route("[controller]/[action]")]
[Produces("application/json")]
public class TransactionsController(
    ILogger<TransactionsController> logger,
    ITransactionsService transactionsService,
    UserManager<IdentityUser> userManager) : ControllerBase
{
    [ProducesResponseType(typeof(List<StrippedTransaction>), StatusCodes.Status200OK )]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        await transactionsService.Sync(user);
        
        var transactions = transactionsService.GetAll(user);
            
        return Ok(transactions);
    }
}