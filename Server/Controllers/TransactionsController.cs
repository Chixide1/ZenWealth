using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Common;
using Server.Data.Models;
using Server.Data.Services;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
[Produces("application/json")]
public class TransactionsController(
    ILogger<TransactionsController> logger,
    ITransactionsService transactionsService,
    UserManager<User> userManager) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<StrippedTransaction>), StatusCodes.Status200OK )]
    public async Task<IActionResult> GetAllUserTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        await transactionsService.SyncAsync(user.Id);
        
        var transactions = await transactionsService.GetAllAsync(user.Id);
            
        return Ok(transactions);
    }
}