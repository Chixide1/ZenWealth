using ZenWealth.Core.Application.Interfaces;
using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Models;
using ZenWealth.Core.Utils.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ZenWealth.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
[Produces("application/json")]
public class BudgetsController(
    IBudgetsService budgetsService,
    UserManager<User> userManager,
    ILogger<BudgetsController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<BudgetDto>))]
    public async Task<IActionResult> GetUserBudgets()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var budgets = await budgetsService.GetBudgetsAsync(user.Id);
        
        return Ok(budgets);
    }
    
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateUserBudgets([FromBody]List<BudgetInputDto> budgets)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            logger.LogWarning("Unable to update budgets - user is unauthorized");
            return Unauthorized();
        }

        if (budgets.Any(b => b.Day != budgets[0].Day))
        {
            logger.LogWarning("User {UserId} attempted to submit budgets with inconsistent days", user.Id);
            return BadRequest("All days should be the same");
        }

        foreach (var budget in budgets)
        {
            var validCategory = Enum.TryParse<ExpenseCategories>(budget.Category, true, out _);

            if (budget.Day is < 1 or > 28)
            {
                logger.LogWarning("User {UserId} attempted to submit budget with invalid day: {Day}", 
                    user.Id, budget.Day);
                
                return BadRequest("All of the budget days must be between 1 and 28");
            }

            if (validCategory == false)
            {
                logger.LogWarning("User {UserId} attempted to submit budget with invalid category: {Category}", 
                    user.Id, budget.Category);
                
                return BadRequest("There is an invalid category in one of the budgets");
            }

            if (budget.Limit < 1)
            {
                await budgetsService.DeleteBudgetAsync(budget.Category, user.Id);
                continue;
            }

            await budgetsService.AddBudgetAsync(new Budget()
            {
                Category = budget.Category.ToUpper(),
                Limit = budget.Limit,
                Day = budget.Day,
                UserId = user.Id
            });
        }
        
        return Ok();
    }
}