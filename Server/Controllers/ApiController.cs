using System.Text.Json;
using System.Text.Json.Nodes;
using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Personal_Finance_App.Server.Utils;

namespace Personal_Finance_App.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ApiController(
        ILogger<ApiController> logger,
        IConfiguration configuration,
        PlaidClient client)
        : ControllerBase
    {
        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Responses.GetLinkTokenResponse), StatusCodes.Status200OK, contentType: "application/json")]
        [ProducesResponseType(typeof(PlaidError), StatusCodes.Status400BadRequest,contentType: "application/json")]
        public async Task<IActionResult> GetLinkToken()
        {
            try
            {
                var response = await client.LinkTokenCreateAsync(new LinkTokenCreateRequest()
                {
                    User = new LinkTokenCreateRequestUser { ClientUserId = Guid.NewGuid().ToString(), },
                    ClientName = "Personal Finance App",
                    Products = [Products.Auth, Products.Identity, Products.Transactions],
                    Language = Language.English,
                    CountryCodes = [CountryCode.Gb],
                });

                if (response.Error != null)
                {
                    dynamic error = JsonNode.Parse(JsonSerializer.Serialize(response.Error))!;
                    string msg = (string)error["error_message"];

                    logger.LogError("{msg}", msg);
                    logger.LogDebug("{test}", typeof(Responses.GetLinkTokenResponse));
                    return StatusCode(StatusCodes.Status400BadRequest, response);
                }

                logger.LogInformation("Successfully obtained link token: {token}", response.LinkToken);
                return Ok(new Responses.GetLinkTokenResponse(response.LinkToken));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPost("[action]")]
        [ProducesResponseType( StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(PlaidError), StatusCodes.Status400BadRequest, contentType: "application/json")]
        public async Task<IActionResult> GetAccessToken([FromBody]string publicToken)
        {
            try
            {
                var response = await client.ItemPublicTokenExchangeAsync(new ItemPublicTokenExchangeRequest()
                {
                    PublicToken = publicToken
                });

                if (response.Error != null)
                {
                    dynamic error = JsonNode.Parse(JsonSerializer.Serialize(response.Error))!;
                    string msg = (string)error["error_message"];

                    logger.LogError("{msg}", msg);
                    return StatusCode(StatusCodes.Status400BadRequest, response);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex);
            }
        }

        [Authorize]
        [HttpGet("[action]")]
        public IActionResult Hello()
        {
            return Ok($"Hello {this.User.Identity!.Name}");
        }
    }
}
