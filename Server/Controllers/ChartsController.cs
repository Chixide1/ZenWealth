namespace Server.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Common;
using Server.Data.Models;
using Server.Data.Services;

[Authorize]
[ApiController]
[Produces("application/json")]
public class ChartsController(
    ILogger<ChartsController> logger,
    ITransactionsService transactionsService,
    UserManager<User> userManager
) : ControllerBase
{
    [HttpGet("[controller]/MonthlyExpenditure")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<MonthlyExpenditure>))]
    public async Task<IActionResult> SyncAllUserTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await transactionsService.MonthlyIncomeAndOutcome(user.Id);
        
        return Ok(results);
    }
}