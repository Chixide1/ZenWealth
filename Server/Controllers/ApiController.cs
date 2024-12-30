using System.Text.Json;
using System.Text.Json.Nodes;
using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Utils;
using Account = Server.Models.Account;
using Item = Server.Models.Item;
using Transaction = Server.Models.Transaction;

namespace Server.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class ApiController(
    ILogger<ApiController> logger,
    IConfiguration configuration,
    PlaidClient client,
    ApplicationDbContext context,
    UserManager<IdentityUser> userManager)
    : ControllerBase
{
    [ApiExplorerSettings(IgnoreApi = true)]
    [Route("/error")]
    public IActionResult HandleError()
    {
        return Problem();
    }
        
    [HttpGet("[action]")]
    public IActionResult Auth()
    {
        return Ok();
    }
        
    [HttpGet("[action]")]
    [ProducesResponseType(typeof(Responses.GetLinkTokenResponse), StatusCodes.Status200OK, "application/json")]
    [ProducesResponseType(typeof(PlaidError), StatusCodes.Status400BadRequest,"application/json")]
    public async Task<IActionResult> GetLinkToken()
    {
        var response = await client.LinkTokenCreateAsync(new LinkTokenCreateRequest()
        {
            User = new LinkTokenCreateRequestUser { ClientUserId = Guid.NewGuid().ToString() },
            ClientName = "ZenWealth",
            Products = [Products.Transactions],
            OptionalProducts = [Products.Investments],
            Language = Language.English,
            CountryCodes = [CountryCode.Gb],
            // EnableMultiItemLink = true
        });

        if (response.Error != null)
        {
            return Error(response.Error);
        }

        logger.LogInformation("Successfully obtained link token: {token}", response.LinkToken);
        return Ok(new Responses.GetLinkTokenResponse(response.LinkToken));
    }


    [HttpPost("[action]")]
    [ProducesResponseType( StatusCodes.Status200OK)]
    [ProducesResponseType<PlaidError>(StatusCodes.Status400BadRequest, "application/json")]
    public async Task<IActionResult> ExchangePublicToken([FromBody] Responses.ExchangePublicTokenResponse data)
    {
        var response = await client.ItemPublicTokenExchangeAsync(new ItemPublicTokenExchangeRequest()
        {
            PublicToken = data.PublicToken
        });

        if (response.Error != null)
        {
            return Error(response.Error);
        }

        var user = await userManager.GetUserAsync(User);
                
        var item = new Item()
        {
            AccessToken = response.AccessToken,
            User = user
        };
            
        context.Items.Add(item);
        await context.SaveChangesAsync();
            
        return Ok(response);
    }

    [HttpGet("[action]")]
    [ProducesResponseType(typeof(Responses.IsAccountConnectedResponse),StatusCodes.Status200OK, "application/json")]
    public async Task<IActionResult> IsAccountConnected()
    {
        var user = await userManager.GetUserAsync(User);
        var connected = await context.Items.AnyAsync(i => i.User == user);
            
        return Ok(new Responses.IsAccountConnectedResponse(connected));
    }
        
    [ProducesResponseType(typeof(Ok<TransactionsGetResponse>), StatusCodes.Status200OK, "application/json" )]
    [HttpGet("[action]")]
    public async Task<IActionResult> GetTransactions([FromQuery] int skip = 0)
    {
        var user = await userManager.GetUserAsync(User);
        var startDate = DateTime.UtcNow.AddDays(-1);
        var accessToken = context.Items
            .Where(i => i.User == user)
            .Select(i => i.AccessToken)
            .First();
            
        var data = await client.TransactionsGetAsync(new TransactionsGetRequest()
        {
            AccessToken = accessToken,
            StartDate = DateOnly.FromDateTime(DateTime.Now.AddYears(-2)),
            EndDate = DateOnly.FromDateTime(DateTime.Now),
            Options = new TransactionsGetRequestOptions()
            {
                Count = 500,
                Offset = skip
            }
        });
            
        return Ok(data);
    }
        
    [ProducesResponseType(typeof(Ok<TransactionsGetResponse>), StatusCodes.Status200OK, "application/json" )]
    [HttpGet("[action]")]
    public async Task<IActionResult> SyncTransactions()
    {
        var user = await userManager.GetUserAsync(User);
        var item = context.Items.SingleOrDefault(i => i.User == user);
        var accessToken = context.Items
            .Where(i => i.User == user)
            .Select(i => i.AccessToken)
            .First();

        if (user is null)
        {
            return Unauthorized();
        }
        
        var data = await client.TransactionsSyncAsync(new TransactionsSyncRequest()
        {
            AccessToken = accessToken,
            Count = 500,
        });

        foreach (var account in data.Accounts)
        {
            context.Accounts.Update(new Account()
            {
                Id = account.AccountId,
                ItemId = item!.Id,
                User = user,
                Name = account.Name,
                Type = account.Type.ToString(),
                Balance = account.Balances.Current == null ? 0.00 : (double)account.Balances.Current,
                Mask = account.Mask,
                Subtype = account.Subtype.ToString(),
                OfficialName = account.OfficialName,
            });
            
            await context.SaveChangesAsync();
        }

        foreach (var transaction in data.Added)
        {
            context.Transactions.Update(new Transaction()
            {
                Id = transaction.TransactionId!,
                AccountId = transaction.AccountId!,
                User = user,
                Name = transaction.Name,
                Amount = transaction.Amount == null ? 0.00 : (double)transaction.Amount,
                Date = transaction.Date,
                Datetime = transaction.Datetime,
                Website = transaction.Website,
                LogoUrl = transaction.LogoUrl,
                MerchantName = transaction.MerchantName,
                PaymentChannel = transaction.PaymentChannel.ToString(),
                TransactionCode = transaction.TransactionCode == null ? null : transaction.TransactionCode.ToString(),
                IsoCurrencyCode = transaction.IsoCurrencyCode,
                PersonalFinanceCategory = transaction.PersonalFinanceCategory!.Primary,
                UnofficialCurrencyCode = transaction.UnofficialCurrencyCode,
                PersonalFinanceCategoryIconUrl = transaction.PersonalFinanceCategoryIconUrl,
            });
            
            await context.SaveChangesAsync();
        }
        
        return Ok();
    }
        
    [ApiExplorerSettings(IgnoreApi = true)]
    private IActionResult Error(PlaidError error)
    {
        logger.LogError(
            "Error Type - {ErrorType}\n" +
            "Error Code - {ErrorCode}\n" +
            "Error Message - {ErrorMessage}",
            error.ErrorType,
            error.ErrorCode,
            error.ErrorMessage);
            
        return StatusCode(StatusCodes.Status400BadRequest, error);
    }
}