using ZenWealth.Core.Application.Interfaces;
using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ZenWealth.Api.Dtos.Requests;
using ZenWealth.Api.Dtos.Responses;
using ZenWealth.Core.Domain.Constants;

namespace ZenWealth.Api.Controllers;

[Authorize]
[ApiController]
[Produces("application/json")]
[Route("[controller]")]
public class TransactionsController(
    ITransactionsService transactionsService,
    IItemsService itemsService,
    UserManager<User> userManager,
    ILogger<TransactionsController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetAllUserTransactionsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactions([FromQuery] GetTransactionsRequest request)
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            logger.LogWarning("Unable to retrieve user transactions - user is unauthorized");
            return Unauthorized();
        }

        if (request.PageSize is < 10 or > 50)
        {
            logger.LogWarning("Unable to retrieve user transactions - The page size must be between 10 and 50");
            return BadRequest();
        }
        
        await itemsService.UpdateItemsAsync(user.Id);

        var transactions = await transactionsService.GetTransactionsAsync(user.Id, request);

        if (request.Sort is TransactionSortOption.AMOUNT_ASC or TransactionSortOption.AMOUNT_DESC)
        {
            logger.LogInformation("Returning transactions sorted by amount for user {UserId}",
                user.Id);
            return Ok(new GetAllUserTransactionsResponseAmount
            (
                Transactions: transactions.Count >= request.PageSize ? transactions[..request.PageSize] : transactions,
                NextCursor: transactions.Count >= request.PageSize ? transactions[..request.PageSize].Last().Id : null,
                NextAmount: transactions.Count > request.PageSize ? transactions[..request.PageSize].Last().Amount : null
            ));
        }
        
        logger.LogInformation("Returning transactions sorted by date for user {UserId}",
            user.Id);
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
            logger.LogWarning("Unable to sync transactions - user is unauthorized");
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
            logger.LogWarning("Unable to retrieve the min & max transaction amounts - user is unauthorized");
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
            logger.LogWarning("Unable to retrieve user transactions - user is unauthorized");
            return Unauthorized();
        }

        var categoryTotals = await transactionsService.GetTransactionsByCategoryAsync(
            userId: user.Id, beginDate: beginDate, endDate: endDate, count: count);
        
        return Ok(categoryTotals);
    }
    
    [HttpGet("FinancialPeriods")]
    [ProducesResponseType(typeof(List<FinancialPeriodDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMonthlyFinancialPeriods()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            logger.LogWarning("Unable to retrieve financial periods - user is unauthorized");
            return Unauthorized();
        }

        var financialPeriods = await transactionsService.GetFinancialPeriods(user.Id);
    
        return Ok(financialPeriods);
    }
}