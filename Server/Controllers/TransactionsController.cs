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
    [ProducesResponseType(typeof(Responses.GetAllUserTransactionsResponse), StatusCodes.Status200OK )]
    public async Task<IActionResult> GetAllUserTransactions(int? id, DateOnly? date, int? pageSize = 10)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        if (pageSize < 10 || pageSize > 50)
        {
            return BadRequest();
        }
        
        await itemsService.UpdateItemsAsync(user.Id);

        var transactions = await transactionsService.GetTransactionsAsync(
            user.Id,
            id ?? 0,
            date ?? new DateOnly(),
            pageSize ?? 0
        );

        return Ok(new Responses.GetAllUserTransactionsResponse
        (
            Transactions: transactions.Take(pageSize ?? 10).ToList(),
            NextCursor: transactions.Count > pageSize ? transactions.Last().Id : null,
            NextDate: transactions.Last().Date
        ));
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