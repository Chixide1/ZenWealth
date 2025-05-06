using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Web;
using System.Security.Claims;
using Api.Dtos.Requests;
using Api.Dtos.Responses;
using Core.Entities;
using Core.Interfaces;
using Core.Utils.Helpers;

namespace Api.Controllers;

[Route("[controller]/[action]")]
[ApiController]
public class AuthController(
    UserManager<User> userManager,
    IEmailService emailService,
    SignInManager<User> signInManager,
    IHostEnvironment env,
    ILogger<AuthController> logger) : ControllerBase
{
    // Helper method to conditionally hash username
    private string LogUsername(string username) => 
        env.IsDevelopment() ? username : HashHelper.HashUsername(username);
    
    // Helper method to conditionally hash email
    private string LogEmail(string email) => 
        env.IsDevelopment() ? email : HashHelper.HashEmail(email);

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            logger.LogWarning("Invalid registration attempt with username: {Username}",
                LogUsername(request.Username));
            return BadRequest(ModelState);
        }

        logger.LogInformation("Registration attempt for username: {Username}, email: {Email}", 
            LogUsername(request.Username), 
            LogEmail(request.Email));
        
        var response = new AuthResponse();

        var user = new User { UserName = request.Username, Email = request.Email };
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            logger.LogWarning("Failed registration for {Username}: {Errors}", 
                LogUsername(request.Username),
                string.Join(", ", result.Errors.Select(e => e.Description)));
            
            response.Errors.AddRange(result.Errors);
            return BadRequest(response);
        }

        logger.LogInformation("User {UserId} ({Username}) registered successfully, sending confirmation email", 
            user.Id, LogUsername(user.UserName));

        // Generate email confirmation token
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);

        // URL encode the token as it may contain special characters
        token = HttpUtility.UrlEncode(token);

        // Create confirmation link with token
        var callbackUrl = $"{emailService.Options.FrontendBaseUrl}/confirmEmail?email={user.Email}&token={token}";

        await emailService.SendEmailConfirmationAsync(user.Email, callbackUrl);

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        logger.LogInformation("Login attempt for username: {Username}",
            LogUsername(request.Username));
        
        var response = new AuthResponse();
        
        var result = await signInManager.PasswordSignInAsync(request.Username, request.Password,
            request.RememberMe, lockoutOnFailure: false);
        
        if (result.Succeeded)
        {
            var user = await userManager.FindByNameAsync(request.Username);
            if (user != null)
            {
                logger.LogInformation("User {UserId} ({Username}) logged in successfully", 
                    user.Id, LogUsername(user.UserName!));
            }
            
            return Ok(response);
        }

        if (result.IsLockedOut)
        {
            logger.LogWarning("Login attempt rejected - account locked out for username: {Username}", 
                LogUsername(request.Username));
            
            response.Errors.Add(new IdentityError
            {
                Code = "Account Lockout",
                Description = "Your account locked out"
            });
            return BadRequest(response);
        }
        
        if (result.RequiresTwoFactor)
        {
            logger.LogInformation("User {Username} requires MFA to complete login", 
                LogUsername(request.Username));
            response.Errors.Add(new IdentityError
            {
                Code = "MFA Required",
                Description = "Requires two-factor authentication"
            });
            return BadRequest(response);
        }
        
        logger.LogWarning("Failed login attempt for username: {Username}", 
            LogUsername(request.Username));
        response.Errors.Add(new IdentityError
        {
            Code = "Failed Login",
            Description = "Check if you're email and password are correct"
        });
        return Unauthorized(response);
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = User.Identity?.Name;
        
        await signInManager.SignOutAsync();
        
        if (userId != null)
        {
            logger.LogInformation("User {UserId} ({Username}) logged out", 
                userId, username != null ? LogUsername(username) : "unknown");
        }
        
        return Ok(new { message = "User logged out successfully" });
    }

    [HttpPost]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
    {
        logger.LogInformation("Password reset requested for email: {Email}", 
            LogEmail(model.Email));
        
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            // Don't reveal that the user does not exist or is not confirmed
            logger.LogInformation("Password reset rejected - email: {Email} not found", 
                LogEmail(model.Email));
            return Ok(new { message = "If your email is registered, you will receive a password reset link." });
        }

        logger.LogInformation("Sending password reset email to user {UserId} ({Email})", 
            user.Id, LogEmail(model.Email));

        // Generate password reset token
        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        // URL encode the token as it may contain special characters
        token = HttpUtility.UrlEncode(token);

        // Create reset link with token (to be used by your frontend)
        var callbackUrl = $"{emailService.Options.FrontendBaseUrl}/resetPassword?email={user.Email}&token={token}";

        await emailService.SendPasswordResetEmailAsync(model.Email, callbackUrl);

        return Ok(new { message = "If your email is registered, you will receive a password reset link." });
    }

    [HttpPost]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
    {
        logger.LogInformation("Password reset attempt for email: {Email}", 
            LogEmail(model.Email));
        
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            logger.LogWarning("Password reset rejected - user not found: {Email}", 
                LogEmail(model.Email));
            return Ok(new { message = "Password has been reset." });
        }
        
        var result = await userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
        if (!result.Succeeded)
        {
            logger.LogWarning("Password reset failed for user {UserId} ({Email}): {Errors}", 
                user.Id, LogEmail(model.Email), string.Join(", ", result.Errors.Select(e => e.Description)));
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

        logger.LogInformation("Password reset successful for user {UserId} ({Email})", 
            user.Id, LogEmail(model.Email));
        
        return Ok(new { message = "Password has been reset successfully." });
    }

    [HttpPost]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest model)
    {
        logger.LogInformation("Email confirmation attempt for email: {Email}", 
            LogEmail(model.Email));
        
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            logger.LogWarning("Email confirmation failed - user not found: {Email}", 
                LogEmail(model.Email));
            return NotFound(new { message = "User not found." });
        }

        var result = await userManager.ConfirmEmailAsync(user, model.Token);
        if (result.Succeeded)
        {
            logger.LogInformation("Email confirmed successfully for user {UserId} ({Email})", 
                user.Id, LogEmail(model.Email));
            return Ok(new { message = "Thank you for confirming your email." });
        }
        
        logger.LogWarning("Email confirmation failed for user {UserId} ({Email}): {Errors}", 
            user.Id, LogEmail(model.Email), string.Join(", ", result.Errors.Select(e => e.Description)));
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
            logger.LogWarning("MFA enable attempt failed - user not found");
            return NotFound(new { message = "User not found." });
        }

        logger.LogInformation("MFA setup initiated for user {UserId} ({Username})", 
            user.Id, LogUsername(user.UserName!));

        // Check if 2FA is already enabled
        if (await userManager.GetTwoFactorEnabledAsync(user))
        {
            logger.LogInformation("MFA setup rejected - already enabled for user {UserId}", user.Id);
            return BadRequest(new { message = "Two-factor authentication is already enabled." });
        }

        // Generate the authenticator key and QR code URL
        var unformattedKey = await userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(unformattedKey))
        {
            await userManager.ResetAuthenticatorKeyAsync(user);
            unformattedKey = await userManager.GetAuthenticatorKeyAsync(user);
            logger.LogInformation("Generated new authenticator key for user {UserId}", user.Id);
        }

        var formattedKey = MfaHelper.FormatAuthenticatorKey(unformattedKey!);
        var qrCodeUrl = MfaHelper.GenerateQrCodeUri(user.Email!, unformattedKey!);
        var qrCodeBytes = MfaHelper.GenerateQrCodeImage(qrCodeUrl);

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
            logger.LogWarning("MFA verification attempt failed - user not found");
            return NotFound(new { message = "User not found." });
        }

        logger.LogInformation("MFA verification attempt for user {UserId} ({Username})", 
            user.Id, LogUsername(user.UserName!));
        
        // Verify the code and enable 2FA if successful
        var isTokenValid = await userManager.VerifyTwoFactorTokenAsync(
            user, userManager.Options.Tokens.AuthenticatorTokenProvider, model.Code);

        if (!isTokenValid)
        {
            logger.LogWarning("MFA verification failed - invalid code provided by user {UserId}", user.Id);
            return BadRequest(new { message = "Verification code is invalid." });
        }

        await userManager.SetTwoFactorEnabledAsync(user, true);
        logger.LogInformation("MFA successfully enabled for user {UserId} ({Username})", 
            user.Id, LogUsername(user.UserName!));
        
        // Generate recovery codes
        var recoveryCodes = await userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);
        logger.LogInformation("Recovery codes generated for user {UserId}", user.Id);

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
            logger.LogWarning("MFA status check failed - user not found");
            return NotFound(new { message = "User not found." });
        }

        var isMfaEnabled = await userManager.GetTwoFactorEnabledAsync(user);
        logger.LogDebug("MFA status check for user {UserId}: Enabled={MfaEnabled}", 
            user.Id, isMfaEnabled);
        
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
            logger.LogWarning("MFA disable attempt failed - user not found");
            return NotFound(new { message = "User not found." });
        }

        logger.LogInformation("MFA disable attempt for user {UserId} ({Username})", 
            user.Id, LogUsername(user.UserName!));

        var result = await userManager.SetTwoFactorEnabledAsync(user, false);
        if (!result.Succeeded)
        {
            logger.LogWarning("MFA disable failed for user {UserId}: {Errors}", 
                user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return BadRequest(new { 
                errors = result.Errors.Select(e => new { code = e.Code, description = e.Description }) 
            });
        }

        logger.LogInformation("MFA successfully disabled for user {UserId} ({Username})", 
            user.Id, LogUsername(user.UserName!));
        return Ok(new { success = true, message = "Two-factor authentication has been disabled." });
    }

    [HttpPost]
    public async Task<IActionResult> LoginWithMfa([FromBody] LoginMfaRequest model)
    {
        logger.LogInformation("MFA login attempt received");
        
        // Get user from sign-in manager session
        var user = await signInManager.GetTwoFactorAuthenticationUserAsync();
        if (user == null)
        {
            logger.LogWarning("MFA login failed - two-factor authentication user not found in session");
            return NotFound(new { message = "Unable to load two-factor authentication user." });
        }

        logger.LogInformation("Processing MFA login for user {UserId} ({Username})", 
            user.Id, LogUsername(user.UserName!));

        var authenticatorCode = model.Code.Replace(" ", string.Empty).Replace("-", string.Empty);

        var result = await signInManager.TwoFactorAuthenticatorSignInAsync(
            authenticatorCode, model.RememberMe, model.RememberMachine);

        if (result.Succeeded)
        {
            logger.LogInformation("User {UserId} ({Username}) successfully completed MFA login", 
                user.Id, LogUsername(user.UserName!));
            return Ok(new { success = true });
        }
        
        if (result.IsLockedOut)
        {
            logger.LogWarning("MFA login failed - account locked out for user {UserId}", user.Id);
            return BadRequest(new { message = "User account locked out." });
        }
        
        logger.LogWarning("MFA login failed - invalid authenticator code for user {UserId}", user.Id);
        return BadRequest(new { message = "Invalid authenticator code." });
    }
}