﻿using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Models;
using Going.Plaid;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using Going.Plaid.Converters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ZenWealth.Infrastructure.ExternalServices;
using ZenWealth.Infrastructure.Persistence;
using ZenWealth.Infrastructure.Persistence.Configurations;
using ZenWealth.Infrastructure.Persistence.Repositories;

namespace ZenWealth.Infrastructure;

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
        // Read the database provider from configuration
        var dbProvider = configuration.GetValue<string>("DatabaseProvider") ?? "SqlServer";
        
        // Register the appropriate factory
        var provider = dbProvider.ToLower() switch
        {
            "postgresql" => ConfigurationFactory.DatabaseProvider.PostgreSql,
            _ => ConfigurationFactory.DatabaseProvider.SqlServer
        };
        
        services.AddSingleton(new ConfigurationFactory(provider));
        
        // Register the DbContext with the appropriate connection
        if (provider == ConfigurationFactory.DatabaseProvider.PostgreSql)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("PostgreSqlConnection"),
                    npgsqlOptions => npgsqlOptions.MigrationsAssembly("ZenWealth.Infrastructure")));
        }
        else
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlServerOptions => sqlServerOptions.MigrationsAssembly("ZenWealth.Infrastructure")));
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

    public static void ConfigurePlaid(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddPlaid(configuration.GetSection(PlaidOptions.SectionKey));
        services.AddScoped<IPlaidService, PlaidService>();
    }
}