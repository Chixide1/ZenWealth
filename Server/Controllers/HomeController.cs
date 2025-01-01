using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.Services;
using Server.Utils;

namespace Server.Controllers;

[Route("")]
[Route("[controller]")]
[Route("[controller]/[action]")]
[Produces("application/json")]
public class HomeController(IItemsService itemsService, UserManager<IdentityUser> userManager) : ControllerBase
{
    [Route("/error")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public IActionResult Error()
    {
        return Problem();
    }
    
    
    [HttpGet]
    [Authorize]
    [ProducesResponseType(type: typeof(Responses.HasItemsResponse), statusCode: 200)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Auth()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var result = itemsService.Check(user);
        return Ok(new Responses.HasItemsResponse(result));
    }
}