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
using Item = Server.Models.Item;

namespace Server.Controllers
{
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
                Products = [Products.Transactions, Products.Investments],
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
                User = user!
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
}
