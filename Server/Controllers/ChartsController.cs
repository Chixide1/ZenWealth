using Going.Plaid.Entity;
using Server.Data.Entities;
using Server.Data.Models.Dtos;
using Server.Services;
using Server.Services.Interfaces;

namespace Server.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.Models;

[Authorize]
[ApiController]
[Route("[controller]/[action]")]
[Produces("application/json")]
public class ChartsController(
    ILogger<ChartsController> logger,
    ITransactionsService transactionsService,
    UserManager<User> userManager
) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<MonthlySummaryDto>))]
    public async Task<IActionResult> MonthlySummary()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await transactionsService.GetMonthlyIncomeAndOutcome(user.Id);
        
        foreach (var monthlySummary in results)
        {
            monthlySummary.Month = monthlySummary.Month[..3];
            monthlySummary.Income = Math.Abs(monthlySummary.Income);
        }

        logger.LogInformation("Retrieved MonthlySummary for user {UserId}", user.Id);
        return Ok(results);
    }
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecentTransactionsDto))]
    public async Task<IActionResult> RecentTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await transactionsService.GetRecentTransactions(user.Id);
        logger.LogInformation("Retrieved RecentTransactions for user {UserId}", user.Id);

        return Ok(results);
    }
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecentTransactionsDto))]
    public async Task<IActionResult> TopExpenseCategories()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await transactionsService.GetTopExpenseCategories(user.Id);
        logger.LogInformation("Retrieved Top Expense Categories for user {UserId}", user.Id);

        return Ok(results);
    }
}