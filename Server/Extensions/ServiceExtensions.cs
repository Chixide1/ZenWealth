using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;
using Server.Data;
using Server.Data.DTOs;
using Server.Data.Models;
using Server.Services;
using System;

namespace Server.Extensions;

public static class ServiceExtensions
{
    /// <summary>
    /// Configures CORS for the application.
    /// </summary>
    /// <param name="services">The service collection to add the CORS policy to.</param>
    public static void ConfigureCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("Dev", policy =>
            {
                policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .AllowAnyMethod();
            });
        });
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
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"))
                .EnableSensitiveDataLogging();
        });
    }
    
    /// <summary>
    /// Configures identity services for the application.
    /// </summary>
    /// <param name="services">The IServiceCollection to add the identity services to.</param>
    /// <remarks>
    public static void ConfigureIdentity(this IServiceCollection services)
    {
        services.AddIdentityApiEndpoints<User>()
            .AddEntityFrameworkStores<AppDbContext>();

        services.Configure<IdentityOptions>(options =>
        {
            options.SignIn.RequireConfirmedEmail = true;
            options.User.RequireUniqueEmail = true;
        });
    }

    /// <summary>
    /// Adds extra services based on the environment.
    /// </summary>
    /// <param name="app">The web application to add the development services to.</param>
    public static void AddEnvironmentConfiguration(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseCors("Dev");
        }
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