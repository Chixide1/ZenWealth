using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.DTOs;
using Server.Data.Models;
using Server.Services;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Produces("application/json")]
[Route("[controller]")]
public class TransactionsController(
    ILogger<TransactionsController> logger,
    ITransactionsService transactionsService,
    IItemsService itemsService,
    UserManager<User> userManager) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetAllUserTransactionsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUserTransactions(
        int cursor = 0,
        DateOnly date = new(),
        int pageSize = 10,
        string? name = null, string? sort = null,
        [FromQuery(Name = "excludeCategories")]
        string[]? excludeCategories = null,
        [FromQuery(Name = "excludeAccounts")] string[]? excludeAccounts = null,
        decimal? amount = null,
        decimal? minAmount = null,
        decimal? maxAmount = null,
        DateOnly? beginDate = null,
        DateOnly? endDate = null
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
            userId: user.Id,
            id: cursor,
            date: date,
            pageSize: pageSize,
            name: name,
            minAmount: minAmount,
            maxAmount: maxAmount,
            sort: sort,
            amount: amount,
            excludeCategories: excludeCategories,
            excludeAccounts: excludeAccounts,
            beginDate: beginDate,
            endDate: endDate
        );

        if (sort is not null && sort.Contains("amount", StringComparison.CurrentCultureIgnoreCase))
        {
            return Ok(new GetAllUserTransactionsResponseAmount
            (
                Transactions: transactions.Count >= pageSize ? transactions[..pageSize] : transactions,
                NextCursor: transactions.Count >= pageSize ? transactions[..pageSize].Last().Id : null,
                NextAmount: transactions.Count > pageSize ? transactions[..pageSize].Last().Amount : null
            ));
        }
        
        return Ok(new GetAllUserTransactionsResponse
        (
            Transactions: transactions.Count >= pageSize ? transactions[..pageSize] : transactions,
            NextCursor: transactions.Count >= pageSize ? transactions.Last().Id : null,
            NextDate: transactions.Count >= pageSize ? transactions.Last().Date : null
        ));
    }
    
    [HttpGet("Sync")]
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
    
    [HttpGet("MinMax")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MinMaxAmountDto))]
    public async Task<IActionResult> GetMinMaxTransactionsAmount()
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
    public async Task<IActionResult> GetTransactionsByCategoryAsync(
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
    
    [HttpGet("MonthlyBreakdowns")]
    [ProducesResponseType(typeof(List<MonthlyBreakdown>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMonthlyBreakdowns()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var breakdowns = await transactionsService.GetMonthlyBreadowns(user.Id);

        foreach (var c in breakdowns.SelectMany(breakdown => breakdown.Income))
        {
            c.Total = Math.Abs(c.Total);
        }
    
        return Ok(breakdowns);
    }
    
    [HttpGet("FinancialPeriods")]
    [ProducesResponseType(typeof(List<FinancialPeriodDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFinancialPeriodsByMonth()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var financialPeriods = await transactionsService.GetFinancialPeriods(user.Id);

        // foreach (var c in breakdowns.SelectMany(breakdown => breakdown.Income))
        // {
        //     c.Total = Math.Abs(c.Total);
        // }
    
        return Ok(financialPeriods);
    }
}

public record GetAllUserTransactionsResponseAmount(
    List<TransactionDto> Transactions,
    int? NextCursor,
    decimal? NextAmount
);

public record GetAllUserTransactionsResponse(
    List<TransactionDto> Transactions,
    int? NextCursor,
    DateOnly? NextDate
);