using Going.Plaid.Entity;

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
    [HttpGet("[controller]/MonthlySummary")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<MonthlySummary>))]
    public async Task<IActionResult> SyncAllUserTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            logger.LogInformation("User is not found, returning Unauthorized");
            return Unauthorized();
        }

        var results = await transactionsService.MonthlyIncomeAndOutcome(user.Id);
        
        foreach (var monthlySummary in results)
        {
            monthlySummary.MonthName = monthlySummary.MonthName.Substring(0, 3);
            monthlySummary.Income = Math.Round(Math.Abs(monthlySummary.Income), 2);
            monthlySummary.Expenditure = Math.Round(monthlySummary.Expenditure, 2);
        }

        logger.LogInformation("Retrieved MonthlySummary for user {UserId}", user.Id);

        return Ok(results);
    }
}