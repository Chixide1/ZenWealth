using Going.Plaid.Entity;
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
public class BudgetsController(
    ILogger<BudgetsController> logger,
    IBudgetsService budgetsService,
    ITransactionsService transactionsService,
    UserManager<User> userManager
) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Budget>))]
    public async Task<IActionResult> GetUserBudgets()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await budgetsService.GetBudgetsAsync(user.Id);
        
        return Ok(results);
    }
    
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AddUserBudgets(string category, decimal limit, int day)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var validCategory = Enum.TryParse<Categories>(category, true, out _);

        if (day > 0 & day < 28 || validCategory == false)
        {
            return BadRequest();
        }

        await budgetsService.AddBudgetAsync(user.Id, new Budget()
        {
            Category = category,
            Limit = limit,
            Day = day,
            UserId = user.Id
        });
        
        return Ok();
    }
}