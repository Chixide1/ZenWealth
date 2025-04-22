using Going.Plaid.Converters;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Server.Data;
using Server.Data.Entities;
using Server.Data.Models.Dtos;
using Server.Data.Repositories.Implementations;
using Server.Data.Repositories.Interfaces;
using Server.Services.Implementations;
using Server.Services.Interfaces;

namespace Server.Utils.Extensions;

public static class ServiceExtensions
{
    /// <summary>
    /// Register Repositories for dependency injection
    /// </summary>
    public static void AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IBudgetRepository, BudgetRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IItemRepository, ItemRepository>();
    }
    
    /// <summary>
    /// Register Services for dependency injection
    /// </summary>
    public static void AddServices(this IServiceCollection services)
    {
        services.AddScoped<IAccountsService, AccountsService>();
        services.AddScoped<IBudgetsService, BudgetsService>();
        services.AddScoped<ITransactionsService, TransactionsService>();
        services.AddScoped<IItemsService, ItemsService>();
    }
    
    /// <summary>
    /// Configures CORS for the application.
    /// </summary>
    public static void ConfigureCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("Dev", policy =>
            {
                policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                    .WithMethods("GET", "POST", "PUT", "DELETE")
                    .WithHeaders("content-type")
                    .AllowCredentials();
            });
            
            options.AddPolicy("Prod", policy =>
            {
                policy.SetIsOriginAllowedToAllowWildcardSubdomains()
                    .WithOrigins("https://*.ckdoestech.com")
                    .WithMethods("GET", "POST", "PUT", "DELETE")
                    .WithHeaders("content-type")
                    .AllowCredentials();
            });
        });
    }
    
    /// <summary>
    /// Adds Controllers and configures how the received json should be serialised & deserialized
    /// </summary>
    public static void ConfigureControllers(this IServiceCollection services)
    {
        services.AddControllers().AddJsonOptions(options =>
            options.JsonSerializerOptions.AddPlaidConverters());
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
            return;
        }

        app.UseCors("Prod");
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