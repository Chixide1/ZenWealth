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
                User = new LinkTokenCreateRequestUser { ClientUserId = Guid.NewGuid().ToString(), },
                ClientName = "ZenWealth",
                Products = [Products.Auth, Products.Identity, Products.Transactions],
                Language = Language.English,
                CountryCodes = [CountryCode.Gb],
            });

            if (response.Error != null)
            {
                dynamic error = JsonNode.Parse(JsonSerializer.Serialize(response.Error))!;
                string msg = (string)error["error_message"];

                logger.LogError("{msg}", msg);
                return StatusCode(StatusCodes.Status400BadRequest, response);
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
                dynamic error = JsonNode.Parse(JsonSerializer.Serialize(response.Error))!;
                var msg = (string)error["error_message"];

                logger.LogError("{msg}", msg);
                return StatusCode(StatusCodes.Status400BadRequest, response);
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
        
        [ProducesResponseType(typeof(Ok<IReadOnlyList<Transaction>>), StatusCodes.Status200OK, "application/json" )]
        [HttpGet("[action]")]
        public async Task<IActionResult> GetTransactions()
        {
            var user = await userManager.GetUserAsync(User);

            var accessToken = context.Items
                .Where(i => i.User == user)
                .Select(i => i.AccessToken)
                .First();
            
            var data = await client.TransactionsGetAsync(new TransactionsGetRequest()
            {
                AccessToken = accessToken,
                StartDate = new DateOnly(2023, 1, 1),
                EndDate = new DateOnly(2024, 1, 1),
                Options = new TransactionsGetRequestOptions()
                {
                    Count = 10
                }
            });
            
            return Ok(data.Transactions);
        }
    }
}
