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
        var response = new AuthController.AuthResponse();

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
        var response = new AuthController.AuthResponse();
        
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
    [ProducesResponseType(type: typeof(AuthController.HasItemsResponse), statusCode: 200)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Details()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }
        
        var result = await itemsService.CheckItemExistsAsync(user.Id);
        return Ok(new AuthController.HasItemsResponse(result, user.UserName!));
    }

    private class  AuthResponse
    {
        public List<IdentityError> Errors { get; } = [];
    }

    public record HasItemsResponse(bool HasItems, string UserName);
}