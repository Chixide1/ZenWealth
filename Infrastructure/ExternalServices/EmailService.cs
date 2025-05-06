using Azure;
using Azure.Communication.Email;
using Core.Interfaces;
using Core.Models;
using Core.Utils.Helpers;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.ExternalServices;

public class AzureCommunicationEmailService(
    EmailClient emailClient,
    IOptions<EmailOptions> options,
    IHostEnvironment env,
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

        await emailClient.SendAsync(WaitUntil.Started, emailMessage);
        
        logger.LogInformation("Email sent to {Email} with subject {EmailSubject}",
            env.IsDevelopment() ? email : HashHelper.HashEmail(email), subject);
    }

    public async Task SendPasswordResetEmailAsync(string email, string callbackUrl)
    {
        const string subject = "Reset your password";
        var message = $@"
            <p>Please reset your password by <a href='{callbackUrl}'>clicking here</a>.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        ";

        await SendEmailAsync(email, subject, message);

        logger.LogInformation("Password reset email sent to {Email}",
            env.IsDevelopment() ? email : HashHelper.HashEmail(email));
    }

    public async Task SendEmailConfirmationAsync(string email, string callbackUrl)
    {
        const string subject = "Confirm your email";
        var message = $@"
            <p>Please confirm your account by <a href='{callbackUrl}'>clicking here</a>.</p>
            <p>If you did not create this account, please ignore this email.</p>
        ";

        await SendEmailAsync(email, subject, message);
        logger.LogInformation("Email confirmation sent to {Email}",
            env.IsDevelopment() ? email : HashHelper.HashEmail(email));
    }
}