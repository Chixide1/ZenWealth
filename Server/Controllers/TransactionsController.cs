using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.Models;
using Server.Data.Models.Dtos;
using Server.Data.Models.Requests;
using Server.Data.Models.Responses;
using Server.Services;
using Server.Services.Interfaces;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Produces("application/json")]
[Route("[controller]")]
public class TransactionsController(
    ITransactionsService transactionsService,
    IItemsService itemsService,
    UserManager<User> userManager) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetAllUserTransactionsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactions([FromQuery] GetTransactionsRequest request)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        if (request.PageSize is < 10 or > 50)
        {
            return BadRequest();
        }
        
        await itemsService.UpdateItemsAsync(user.Id);

        var transactions = await transactionsService.GetTransactionsAsync(user.Id, request);

        if (request.Sort is not null && request.Sort.Contains("amount", StringComparison.CurrentCultureIgnoreCase))
        {
            return Ok(new GetAllUserTransactionsResponseAmount
            (
                Transactions: transactions.Count >= request.PageSize ? transactions[..request.PageSize] : transactions,
                NextCursor: transactions.Count >= request.PageSize ? transactions[..request.PageSize].Last().Id : null,
                NextAmount: transactions.Count > request.PageSize ? transactions[..request.PageSize].Last().Amount : null
            ));
        }
        
        return Ok(new GetAllUserTransactionsResponse
        (
            Transactions: transactions.Count >= request.PageSize ? transactions[..request.PageSize] : transactions,
            NextCursor: transactions.Count >= request.PageSize ? transactions.Last().Id : null,
            NextDate: transactions.Count >= request.PageSize ? transactions.Last().Date : null
        ));
    }
    
    [HttpGet("Sync")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SyncTransactions()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var updatedCount = await itemsService.UpdateItemsAsync(user.Id);
        
        return Ok(new { Message = $"{updatedCount} transactions added" });
    }
    
    [HttpGet("MinMax")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MinMaxAmountDto))]
    public async Task<IActionResult> GetAmountRanges()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var results = await transactionsService.GetMinMaxAmount(user.Id);
        
        return Ok(results);
    }

    [HttpGet("CategoryTotals")]
    [ProducesResponseType(typeof(List<CategoryTotalDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategoryTotals(
        int count = 0,
        DateOnly? beginDate = null,
        DateOnly? endDate = null
    )
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var categoryTotals = await transactionsService.GetTransactionsByCategoryAsync(
            userId: user.Id,
            beginDate: beginDate,
            endDate: endDate,
            count: count
        );
        
        return Ok(categoryTotals);
    }
    
    [HttpGet("FinancialPeriods")]
    [ProducesResponseType(typeof(List<FinancialPeriodDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMonthlyFinancialPeriods()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var financialPeriods = await transactionsService.GetFinancialPeriods(user.Id);
    
        return Ok(financialPeriods);
    }
}