using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Common;
using Server.Data.Models;
using Server.Data.Services;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Produces("application/json")]
public class TransactionsController(
    ILogger<TransactionsController> logger,
    ITransactionsService transactionsService,
    IItemsService itemsService,
    UserManager<User> userManager) : ControllerBase
{
    [HttpGet("[controller]")]
    [ProducesResponseType(typeof(List<TransactionDto>), StatusCodes.Status200OK )]
    public async Task<IActionResult> GetAllUserTransactions(int cursor = 1, int pageSize = 10)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        if (cursor < 1 || pageSize < 10 || pageSize > 50)
        {
            return BadRequest();
        }
        
        await itemsService.UpdateItemsAsync(user.Id);
        
        var transactions = await transactionsService.GetUserTransactionsAsync(user.Id, cursor, pageSize);
            
        return Ok(transactions);
    }
    
    [HttpGet("[controller]/Sync")]
    [ProducesResponseType(StatusCodes.Status200OK )]
    public async Task<IActionResult> SyncAllUserTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        await itemsService.UpdateItemsAsync(user.Id);
        
        return Ok();
    }
}