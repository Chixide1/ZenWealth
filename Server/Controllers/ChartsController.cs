﻿using Going.Plaid.Entity;

namespace Server.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Common;
using Server.Data.Models;
using Server.Data.Services;

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
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<MonthlySummary>))]
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
            monthlySummary.Income = Math.Round(Math.Abs(monthlySummary.Income), 2);
            monthlySummary.Expenditure = Math.Round(monthlySummary.Expenditure, 2);
        }

        logger.LogInformation("Retrieved MonthlySummary for user {UserId}", user.Id);

        return Ok(results);
    }
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecentTransactions))]
    public async Task<IActionResult> RecentTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await transactionsService.GetRecentTransactions(user.Id);
        
        foreach (var r in results.Income)
        {
            r.Amount = Math.Round(Math.Abs(r.Amount), 2);
        }

        logger.LogInformation("Retrieved RecentTransactions for user {UserId}", user.Id);

        return Ok(results);
    }
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecentTransactions))]
    public async Task<IActionResult> TopExpenseCategories()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await transactionsService.GetTopExpenseCategories(user.Id);
        
        foreach (var r in results)
        {
            r.Expenditure = Math.Round(r.Expenditure, 2);
            r.Total = Math.Round(r.Total, 2);
        }

        logger.LogInformation("Retrieved Top Expense Categories for user {UserId}", user.Id);

        return Ok(results);
    }
}