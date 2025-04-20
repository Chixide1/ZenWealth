using Azure;
using Azure.Communication.Email;
using Microsoft.Extensions.Options;
using Server.Services.Interfaces;

namespace Server.Services.Implementations;

public class AzureCommunicationEmailService(
    EmailClient emailClient,
    IOptions<EmailOptions> options,
    ILogger<AzureCommunicationEmailService> logger) : IEmailService
{
    public EmailOptions Options => options.Value;

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var emailContent = new EmailContent(subject)
        {
            Html = htmlMessage
        };

        var emailMessage = new EmailMessage(
            senderAddress: Options.SenderEmail,
            recipientAddress: email,
            content: emailContent);

        await emailClient.SendAsync(WaitUntil.Completed, emailMessage);
        logger.LogInformation("Email sent to {Email} with subject {EmailSubject}", email, subject);
    }

    public async Task SendPasswordResetEmailAsync(string email, string callbackUrl)
    {
        string subject = "Reset your password";
        string message = $@"
            <p>Please reset your password by <a href='{callbackUrl}'>clicking here</a>.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        ";

        await SendEmailAsync(email, subject, message);
        logger.LogInformation("Password reset email sent to {Email}", email);
    }

    public async Task SendEmailConfirmationAsync(string email, string callbackUrl)
    {
        string subject = "Confirm your email";
        string message = $@"
            <p>Please confirm your account by <a href='{callbackUrl}'>clicking here</a>.</p>
            <p>If you did not create this account, please ignore this email.</p>
        ";

        await SendEmailAsync(email, subject, message);
        logger.LogInformation("Email confirmation sent to {Email}", email);
    }
}

public class EmailOptions
{
    public string SenderEmail { get; init; } = string.Empty;
    public string FrontendBaseUrl { get; init; } = string.Empty;
}