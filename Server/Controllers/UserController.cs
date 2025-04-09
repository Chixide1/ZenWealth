using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.DTOs;
using Server.Data.Models;
using Server.Services;

namespace Server.Controllers;

[Authorize]
[Route("[controller]")]
[ApiController]
public class UserController(UserManager<User> userManager,
    IItemsService itemsService) : Controller
{
    [HttpGet]
    [ProducesResponseType(type: typeof(UserDetailsResponse), statusCode: 200)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Details()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var result = await itemsService.GetItemsAsync(user.Id);
        return Ok(new UserDetailsResponse(user.UserName!, user.Email!, result));
    }

    [HttpDelete]
    [ProducesResponseType(type: typeof(DeleteUserResponse), statusCode: 200)]
    [ProducesResponseType(type: typeof(DeleteUserResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteUser()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var items = await itemsService.GetItemsAsync(user.Id);

        foreach (var item in items)
        {
            var status = await itemsService.DeleteItemAsync(user.Id, item.Id);

            if (!status)
            {
                return StatusCode(500, "unable to delete item");
            }
        }

        var result = await userManager.DeleteAsync(user);

        return result.Succeeded ?
            Ok(new DeleteUserResponse(Success: true, Array.Empty<IdentityError>())) :
            StatusCode(500, new DeleteUserResponse(false, result.Errors));
    }

    [HttpGet("[action]")]
    [ProducesResponseType(type: typeof(HasItemsResponse), statusCode: 200)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ItemsStatus()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var result = await itemsService.CheckItemExistsAsync(user.Id);
        return Ok(new HasItemsResponse(result));
    }
}

public record DeleteUserResponse(bool Success, IEnumerable<IdentityError> Errors)
{
    public override string ToString()
    {
        return $"{{ Success = {Success}, Errors = {Errors} }}";
    }
}

public record HasItemsResponse(bool HasItems);

public record UserDetailsResponse(string UserName, string Email, IEnumerable<InstitutionDto> Institutions);
