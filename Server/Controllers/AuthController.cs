using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Server.Data.DTOs;
using Server.Data.Models;
using Server.Services;
using System.ComponentModel.DataAnnotations;
using System.Web;

namespace Server.Controllers;

[Route("[controller]/[action]")]
[ApiController]
public class AuthController(UserManager<User> userManager,
    IEmailService emailService,
    IOptions<EmailOptions> emailOptions,
    SignInManager<User> signInManager) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var response = new AuthResponse();

        var user = new User { UserName = dto.Username, Email = dto.Email };
        var result = await userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            response.Errors.AddRange(result.Errors);
            return BadRequest(response);
        }

        // Generate email confirmation token
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);

        // URL encode the token as it may contain special characters
        token = HttpUtility.UrlEncode(token);

        // Create confirmation link with token
        var callbackUrl = $"{emailOptions.Value.FrontendBaseUrl}/confirmEmail?email={user.Email}&token={token}";

        await emailService.SendEmailConfirmationAsync(user.Email, callbackUrl);

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
        return Ok(new { message = "User logged out successfully" });
    }

    [HttpPost]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null || !(await userManager.IsEmailConfirmedAsync(user)))
        {
            // Don't reveal that the user does not exist or is not confirmed
            return Ok(new { message = "If your email is registered, you will receive a password reset link." });
        }

        // Generate password reset token
        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        // URL encode the token as it may contain special characters
        token = HttpUtility.UrlEncode(token);

        // Create reset link with token (to be used by your frontend)
        var callbackUrl = $"{emailOptions.Value.FrontendBaseUrl}/resetPassword?email={user.Email}&token={token}";

        await emailService.SendPasswordResetEmailAsync(model.Email, callbackUrl);

        return Ok(new { message = "If your email is registered, you will receive a password reset link." });
    }

    [HttpPost]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            // Don't reveal that the user does not exist
            return Ok(new { message = "Password has been reset." });
        }

        // // Decode token if it was encoded on the client side
        // var token = HttpUtility.UrlDecode(model.Token);

        var result = await userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }

        return Ok(new { message = "Password has been reset successfully." });
    }

    [HttpPost]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        var result = await userManager.ConfirmEmailAsync(user, model.Token);
        if (result.Succeeded) return Ok(new { message = "Thank you for confirming your email." });
        
        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(error.Code, error.Description);
        }
        return BadRequest(new { Errors = ModelState});

    }

    [HttpPost]
    public async Task<IActionResult> ResendConfirmationEmail([FromBody] ResendConfirmationRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            // Don't reveal that the user does not exist
            return Ok(new { message = "If your email is registered, you will receive a confirmation link." });
        }

        if (await userManager.IsEmailConfirmedAsync(user))
        {
            return BadRequest(new { message = "Email is already confirmed." });
        }

        // Generate email confirmation token
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);

        // URL encode the token as it may contain special characters
        token = HttpUtility.UrlEncode(token);

        // Create confirmation link with token
        var callbackUrl = $"{emailOptions.Value.FrontendBaseUrl}/confirmEmail?email={user.Email}&token={token}";

        await emailService.SendEmailConfirmationAsync(model.Email, callbackUrl);

        return Ok(new { message = "Confirmation email sent. Please check your email." });
    }
}

internal class AuthResponse
{
    public List<IdentityError> Errors { get; } = [];
}

// Request Models
public class ForgotPasswordRequest
{
    [EmailAddress]
    public required string Email { get; set; }
}

public class ResetPasswordRequest
{
    [EmailAddress]
    public required string Email { get; set; }

    public required string Token { get; set; }

    [StringLength(100, MinimumLength = 6)]
    public required string NewPassword { get; set; }

    [Compare("NewPassword")]
    public required string ConfirmPassword { get; set; }
}

public class ConfirmEmailRequest
{
    [EmailAddress]
    public required string Email { get; set; }

    public required string Token { get; set; }
}

public class ResendConfirmationRequest
{
    [EmailAddress]
    public required string Email { get; set; }
}