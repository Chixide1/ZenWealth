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
        logger.LogInformation(
            "Email sent to {Email} with subject {EmailSubject}", 
            MaskEmail(email), 
            subject
        );
        logger.LogDebug("Full email sent to {Email} with subject {EmailSubject}", email, subject);
    }

    public async Task SendPasswordResetEmailAsync(string email, string callbackUrl)
    {
        const string subject = "Reset your password";
        var message = $@"
            <p>Please reset your password by <a href='{callbackUrl}'>clicking here</a>.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        ";

        await SendEmailAsync(email, subject, message);
        logger.LogInformation("Password reset email sent to {Email}", MaskEmail(email));
    }

    public async Task SendEmailConfirmationAsync(string email, string callbackUrl)
    {
        const string subject = "Confirm your email";
        var message = $@"
            <p>Please confirm your account by <a href='{callbackUrl}'>clicking here</a>.</p>
            <p>If you did not create this account, please ignore this email.</p>
        ";

        await SendEmailAsync(email, subject, message);
        logger.LogInformation("Email confirmation sent to {Email}", MaskEmail(email));
    }

    // Mask email helper
    private static string MaskEmail(string email)
    {
        if (string.IsNullOrEmpty(email) || !email.Contains('@'))
            return "***@***";

        var parts = email.Split('@');
        var localPart = parts[0];
        var domain = parts[1];

        var maskedLocal = localPart.Length > 2 
            ? $"{localPart[0]}***{localPart[^1]}"
            : "***";

        return $"{maskedLocal}@{domain}";
    }
}

public class EmailOptions
{
    public string SenderEmail { get; init; } = string.Empty;
    public string FrontendBaseUrl { get; init; } = string.Empty;
}