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
    [ProducesResponseType(typeof(List<TransactionDto>), StatusCodes.Status200OK )]
    public async Task<IActionResult> GetAllUserTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        await transactionsService.FetchLatestTransactionsAsync(user.Id);
        
        var transactions = await transactionsService.GetUserTransactionsAsync(user.Id);
            
        return Ok(transactions);
    }
}