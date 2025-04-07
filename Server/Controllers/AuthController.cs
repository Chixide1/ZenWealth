using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.DTOs;
using Server.Data.Models;
using Server.Services;

namespace Server.Controllers;

[Route("[controller]/[action]")]
[ApiController]
public class AuthController(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IItemsService itemsService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var response = new AuthResponse();

        var user = new User { UserName = dto.Username, Email = dto.Email };
        var result = await userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            response.Errors.AddRange(result.Errors);
            return BadRequest(response);
        }
        
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var response = new AuthResponse();
        
        var result = await signInManager.PasswordSignInAsync(
            dto.Username,
            dto.Password,
            dto.RememberMe,
            lockoutOnFailure: false
        );
        
        if (result.Succeeded)
        {
            return Ok(response);
        }

        if (result.IsLockedOut)
        {
            response.Errors.Add(new IdentityError { Code = "Account Lockout", Description = "Your account locked out" });
            return BadRequest(response);
        }
        
        if (result.RequiresTwoFactor)
        {
            response.Errors.Add(new IdentityError { Code = "MFA Required", Description = "Requires two-factor authentication"});
            return BadRequest(response);
        }
        
        response.Errors.Add(new IdentityError { Code = "Failed Login", Description = "Check if you're email and password are correct"});
        return Unauthorized(response);
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return Ok("User logged out successfully");
    }
    
    [HttpGet]
    [Authorize]
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
    
    [HttpGet]
    [Authorize]
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
    [Authorize]
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
            Ok(new DeleteUserResponse(Success: true, Array.Empty<IdentityError>() )) :
            StatusCode(500, new DeleteUserResponse(false, result.Errors));
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

internal class AuthResponse
{
    public List<IdentityError> Errors { get; } = [];
}