namespace Server.Services;

/// <summary>
/// Service used for sending emails.
/// </summary>
public interface IEmailService
{
    public EmailOptions Options { get; }
    
    /// <summary>
    /// Sends an email to the specified address with the specified subject and HTML message.
    /// </summary>
    Task SendEmailAsync(string email, string subject, string htmlMessage);

    /// <summary>
    /// Sends a password reset email to the specified address with the URL which will reset the password.
    /// </summary>
    Task SendPasswordResetEmailAsync(string email, string callbackUrl);

    /// <summary>
    /// Sends an email confirmation to the specified address with the URL which will confirm the email.
    /// </summary>
    Task SendEmailConfirmationAsync(string email, string callbackUrl);
}
