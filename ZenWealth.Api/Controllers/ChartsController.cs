﻿using ZenWealth.Core.Models;
using Going.Plaid.Entity;

namespace ZenWealth.Api.Controllers;

using Core.Application.Interfaces;
using Core.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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
            logger.LogWarning("Unable to retrieve monthly summaries - user is unauthorized");
            return Unauthorized();
        }

        var results = await transactionsService.GetMonthlyIncomeAndOutcome(user.Id);
        
        foreach (var monthlySummary in results)
        {
            // Change the month to be its three letter abbreviation
            monthlySummary.Month = monthlySummary.Month[..3];
            
            // Make income positive for frontend
            monthlySummary.Income = Math.Abs(monthlySummary.Income);
        }
        
        return Ok(results);
    }
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecentTransactionsDto))]
    public async Task<IActionResult> RecentTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            logger.LogWarning("Unable to retrieve recent transactions - user is unauthorized");
            return Unauthorized();
        }

        var results = await transactionsService.GetRecentTransactions(user.Id);

        return Ok(results);
    }
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecentTransactionsDto))]
    public async Task<IActionResult> TopExpenseCategories()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            logger.LogWarning("Unable to retrieve top expense categories - user is unauthorized");
            return Unauthorized();
        }

        var results = await transactionsService.GetTopExpenseCategories(user.Id);

        return Ok(results);
    }
}