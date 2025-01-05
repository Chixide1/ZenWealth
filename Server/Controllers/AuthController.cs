using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Common;
using Server.Data.Models;
using Server.Data.Services;

namespace Server.Controllers;

[Route("")]
[Route("[controller]")]
[Produces("application/json")]
public class AuthController(IItemsService itemsService, UserManager<User> userManager) : ControllerBase
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(type: typeof(Responses.HasItemsResponse), statusCode: 200)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AuthAndItemStatus()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var result = await itemsService.CheckItemExistsAsync(user.Id);
        return Ok(new Responses.HasItemsResponse(result, user.UserName!));
    }
}