using ZenWealth.Api;
using ZenWealth.Api.Middleware;
using ZenWealth.Core;
using ZenWealth.Infrastructure;
using Serilog;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureDbContext(builder.Configuration);
builder.Services.ConfigureIdentity();
builder.Services.AddAuthorization();
builder.Services.ConfigureCors();
builder.Services.ConfigureControllers();
builder.Services.AddRepositories();
builder.Services.AddServices();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.ConfigurePlaid(builder.Configuration);
builder.Services.ConfigureEmail(builder.Configuration);

builder.Host.UseSerilogLogging();

var app = builder.Build();

// Apply database migrations
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
}

await app.SeedDemoUserWithRetry();
app.UseDefaultFiles();
app.MapStaticAssets();
app.UseSerilogRequestLogging();
app.AddEnvironmentConfiguration();
app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
