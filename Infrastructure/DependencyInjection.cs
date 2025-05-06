using Core.Entities;
using Core.Interfaces;
using Core.Models;
using Infrastructure.ExternalServices;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    // /// <summary>
    // /// Register Repositories for dependency injection
    // /// </summary>
    public static void AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IBudgetRepository, BudgetRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IItemRepository, ItemRepository>();
    }
    
    /// <summary>
    /// Configures the database context for the application.
    /// </summary>
    /// <param name="services">The service collection to add the database context to.</param>
    /// <param name="configuration">The application configuration used to retrieve the connection string.</param>
    public static void ConfigureDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                    sqlServerOptions => 
                    {
                        sqlServerOptions.CommandTimeout(60);
                        sqlServerOptions.EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(5),
                            errorNumbersToAdd: [-2] // SQL timeout error code
                        );
                    })
                .EnableSensitiveDataLogging();
        });
    }
    
    /// <summary>
    /// Adds Azure Communication Services email client and configuration.
    /// </summary>
    /// <param name="services">The IServiceCollection to add the identity services to.</param>
    /// /// <param name="configuration">The config where the email client values should be pulled from.</param>
    public static void ConfigureEmail(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Azure client
        services.AddAzureClients(azureBuilder =>
        {
            azureBuilder.AddEmailClient(configuration.GetConnectionString("AzureCommunicationServices"));
        });

        // Configure email options
        services.Configure<EmailOptions>(configuration.GetSection("EmailSettings"));

        // Register the email service
        services.AddScoped<IEmailService, AzureCommunicationEmailService>();
    }
}