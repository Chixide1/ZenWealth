using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Data.DTOs;
using Server.Data.Models;

namespace Server.Extensions;

public static class ServiceExtensions
{
    /// <summary>
    /// Configures CORS for the application.
    /// </summary>
    /// <remarks>
    /// This extension method adds the "Dev" CORS policy to the application.
    /// This policy allows requests from any origin, with any method, and with any header.
    /// </remarks>
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
    /// <remarks>
    /// This extension method adds the application's database context to the service collection,
    /// using SQL Server as the database provider. It retrieves the connection string from the configuration 
    /// and enables sensitive data logging for debugging purposes.
    /// </remarks>
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
    /// This extension method adds identity API endpoints for the User entity and configures the identity options.
    /// It requires users to confirm their email before signing in and enforces unique emails for user accounts.
    /// </remarks>
    public static void ConfigureIdentity(this IServiceCollection services)
    {
        services.AddIdentityApiEndpoints<User>()
            .AddEntityFrameworkStores<AppDbContext>();

        services.Configure<IdentityOptions>(options =>
        {
            // options.SignIn.RequireConfirmedEmail = true;
            options.User.RequireUniqueEmail = true;
        });
    }

    /// <summary>
    /// Adds services for development, if the app is running in a development environment.
    /// </summary>
    /// <remarks>
    /// This extension method adds Swagger and Swagger UI to the request pipeline if the app is running in a development environment, 
    /// and enables CORS for the "Dev" policy.
    /// </remarks>
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
    /// Convert Transactions into Transaction Data Transfer Object
    /// </summary>
    /// <remarks>
    /// This extension method selects only the necessary fields from the table through LINQ to be returned to the frontend 
    /// </remarks>
    /// <param name="transaction">The Transaction IQueryable</param>
    public static IQueryable<TransactionDto> ToTransactionDto(this IQueryable<Transaction> transaction)
    {
        var transactionDto = transaction
            .Include(t => t.Account)
            .Select(t => new TransactionDto()
            {
                Id = t.Id,
                Name = t.Name,
                AccountName = t.Account.Name,
                Amount = t.Amount,
                Date = t.Date,
                Datetime = t.Datetime,
                IsoCurrencyCode = t.IsoCurrencyCode ?? t.UnofficialCurrencyCode ?? "GBP",
                Category = t.Category ?? "UNKNOWN",
                LogoUrl = t.LogoUrl,
                CategoryIconUrl = t.CategoryIconUrl,
            });
        
        return transactionDto;
    }
}