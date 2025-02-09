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
    [ProducesResponseType(typeof(Responses.GetAllUserTransactionsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUserTransactions(
        int cursor = 0, DateOnly date = new DateOnly(), int pageSize = 10,
        string? name = null, string? sort = null
    )
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        if (pageSize is < 10 or > 50)
        {
            return BadRequest();
        }
        
        await itemsService.UpdateItemsAsync(user.Id);

        var transactions = await transactionsService.GetTransactionsAsync(
            user.Id,
            id: cursor,
            date,
            pageSize,
            name, 
            sort: sort
        );

        return Ok(new Responses.GetAllUserTransactionsResponse
        (
            Transactions: transactions.Count >= pageSize ? transactions[..pageSize] : transactions,
            NextCursor: transactions.Count > pageSize ? transactions.Last().Id : null,
            NextDate: transactions.Count >= pageSize ? transactions.Last().Date : null
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

        var updatedCount = await itemsService.UpdateItemsAsync(user.Id);
        
        return Ok(new { Message = $"{updatedCount} transactions added" });
    }
}