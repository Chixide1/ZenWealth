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
using Server.Utils;

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

        // Mark email as confirmed since user has proven access to it
        if (!user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            await userManager.UpdateAsync(user);
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

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> EnableMfa()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Check if 2FA is already enabled
        if (await userManager.GetTwoFactorEnabledAsync(user))
        {
            return BadRequest(new { message = "Two-factor authentication is already enabled." });
        }

        // Generate the authenticator key and QR code URL
        var unformattedKey = await userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(unformattedKey))
        {
            await userManager.ResetAuthenticatorKeyAsync(user);
            unformattedKey = await userManager.GetAuthenticatorKeyAsync(user);
        }

        var formattedKey = MfaUtil.FormatAuthenticatorKey(unformattedKey!);
        var qrCodeUrl = MfaUtil.GenerateQrCodeUri(user.Email!, unformattedKey!);
        var qrCodeBytes = MfaUtil.GenerateQrCodeImage(qrCodeUrl);

        return Ok(new
        {
            sharedKey = formattedKey,
            authenticatorUri = qrCodeUrl,
            qrCode = Convert.ToBase64String(qrCodeBytes)
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> VerifyMfaCode([FromBody] VerifyMfaRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Verify the code and enable 2FA if successful
        var isTokenValid = await userManager.VerifyTwoFactorTokenAsync(
            user, userManager.Options.Tokens.AuthenticatorTokenProvider, model.Code);

        if (!isTokenValid)
        {
            return BadRequest(new { message = "Verification code is invalid." });
        }

        await userManager.SetTwoFactorEnabledAsync(user, true);
        
        // Generate recovery codes
        var recoveryCodes = await userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);

        return Ok(new { 
            success = true, 
            message = "Two-factor authentication has been enabled.",
            recoveryCodes
        });
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetMfaStatus()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        var isMfaEnabled = await userManager.GetTwoFactorEnabledAsync(user);
        
        return Ok(new { 
            enabled = isMfaEnabled
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> DisableMfa()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        var result = await userManager.SetTwoFactorEnabledAsync(user, false);
        if (!result.Succeeded)
        {
            return BadRequest(new { 
                errors = result.Errors.Select(e => new { code = e.Code, description = e.Description }) 
            });
        }

        return Ok(new { success = true, message = "Two-factor authentication has been disabled." });
    }

    [HttpPost]
    public async Task<IActionResult> LoginWithMfa([FromBody] LoginMfaDto model)
    {
        // Get user from sign-in manager session
        var user = await signInManager.GetTwoFactorAuthenticationUserAsync();
        if (user == null)
        {
            return NotFound(new { message = "Unable to load two-factor authentication user." });
        }

        var authenticatorCode = model.Code.Replace(" ", string.Empty).Replace("-", string.Empty);

        var result = await signInManager.TwoFactorAuthenticatorSignInAsync(authenticatorCode, model.RememberMe, model.RememberMachine);

        if (result.Succeeded)
        {
            return Ok(new { success = true });
        }
        
        if (result.IsLockedOut)
        {
            return BadRequest(new { message = "User account locked out." });
        }
        
        return BadRequest(new { message = "Invalid authenticator code." });
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

public class VerifyMfaRequest
{
    [Required]
    [StringLength(7, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Text)]
    public required string Code { get; set; }
}

public class LoginMfaDto
{
    [Required]
    public required string Code { get; set; }

    public bool RememberMe { get; set; }

    public bool RememberMachine { get; set; }
}