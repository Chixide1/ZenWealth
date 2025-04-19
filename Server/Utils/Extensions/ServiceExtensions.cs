using Going.Plaid.Converters;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Server.Data;
using Server.Data.Models;
using Server.Services;
using Server.Services.Implementations;
using Server.Services.Interfaces;

namespace Server.Utils.Extensions;

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
    /// Adds Controllers and configures how the received json should be serialised & deserialized
    /// </summary>
    /// <param name="services">The service collection to add the Controller to.</param>
    public static void ConfigureControllers(this IServiceCollection services)
    {
        services.AddControllers().AddJsonOptions(options =>
            options.JsonSerializerOptions.AddPlaidConverters());
        
        // Alternate way to convert Enums to string
        // services.AddControllers().AddJsonOptions(options =>
        // {
        //     options.JsonSerializerOptions.Converters.Add(
        //         new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseUpper));
        //     options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        // });
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