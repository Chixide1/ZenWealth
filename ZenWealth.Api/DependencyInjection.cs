using System.ComponentModel;
using ZenWealth.Core.Domain.Entities;
using Going.Plaid.Converters;
using ZenWealth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;
using ZenWealth.Api.ModelBinders;
using ZenWealth.Core.Common.Converters;
using ZenWealth.Infrastructure;

namespace ZenWealth.Api;

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
        // TypeDescriptor.AddAttributes(typeof(TransactionSortOption),
        //     new TypeConverterAttribute(typeof(TransactionSortOptionConverter)));
        
        services.AddControllers(options =>
        {
            options.ModelBinderProviders.Insert(0, new TransactionSortOptionModelBinderProvider());
        }).AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.AddPlaidConverters();
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
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>();

        services.Configure<IdentityOptions>(options =>
        {
            options.SignIn.RequireConfirmedEmail = true;
            options.User.RequireUniqueEmail = true;
        });
    }
    
    /// <summary>
    /// Seeds the DemoUser role if it doesn't exist.
    /// </summary>
    /// <param name="app">The web application.</param>
    public static async Task SeedDemoUserRole(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
        if (!await roleManager.RoleExistsAsync("DemoUser"))
        {
            await roleManager.CreateAsync(new IdentityRole("DemoUser"));
        }
    }

    /// <summary>
    /// Seeds a demo user with DemoUser role for development/testing purposes.
    /// </summary>
    /// <param name="app">The web application.</param>
    public static async Task SeedDemoUser(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        
        // Create DemoUser role if it doesn't exist
        if (!await roleManager.RoleExistsAsync("DemoUser"))
        {
            await roleManager.CreateAsync(new IdentityRole("DemoUser"));
        }
        
        // Create demo user if it doesn't exist
        const string demoEmail = "demo@zenwealth.com";
        const string demoUsername = "DemoUser";
        const string demoPassword = "DemoUser123!";
        
        var existingUser = await userManager.FindByEmailAsync(demoEmail);
        if (existingUser == null)
        {
            var demoUser = new User
            {
                UserName = demoUsername,
                Email = demoEmail,
                EmailConfirmed = true // Skip email confirmation for demo user
            };
            
            var result = await userManager.CreateAsync(demoUser, demoPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(demoUser, "DemoUser");
            }
        }
    }
}