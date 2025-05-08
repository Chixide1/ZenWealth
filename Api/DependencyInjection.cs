using Core.Domain.Entities;
using Going.Plaid.Converters;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace Api;

public static class DependencyInjection
{
    public static void UseSerilogLogging(this IHostBuilder hostBuilder)
    {
        hostBuilder.UseSerilog((_, _, configuration) =>
        {
            var appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "ZenWealth-Api-Logs"
            );
            Directory.CreateDirectory(appDataPath); // Create if missing

            var logFilePath = Path.Combine(
                appDataPath,
                $"log-{DateTime.Now:dd-MM-yyyy}.json" // Daily rotating logs
            );

            configuration
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .MinimumLevel.Override("System", LogEventLevel.Warning)
                .WriteTo.Console()
                .WriteTo.File(
                    new CompactJsonFormatter(),
                    logFilePath,
                    rollingInterval: RollingInterval.Day,
                    rollOnFileSizeLimit: true
                )
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", "ZenWealth");
        });
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
                policy.SetIsOriginAllowed(origin => 
                        new Uri(origin).Host == "localhost" || new Uri(origin).Host == "127.0.0.1")
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
    /// Adds Controllers and configures how the received JSON should be serialized & deserialized
    /// </summary>
    public static void ConfigureControllers(this IServiceCollection services)
    {
        services.AddControllers().AddJsonOptions(options =>
            options.JsonSerializerOptions.AddPlaidConverters());
    }

    /// <summary>
    /// Adds extra services based on the environment.
    /// </summary>
    /// <param name="app">The web application to add the development services to.</param>
    public static void AddEnvironmentConfiguration(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.MapScalarApiReference();
            app.UseCors("Dev");
            return;
        }

        app.UseCors("Prod");
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
}