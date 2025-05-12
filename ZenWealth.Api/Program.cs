using ZenWealth.Api;
using ZenWealth.Api.Middleware;
using ZenWealth.Core;
using Going.Plaid;
using ZenWealth.Infrastructure;
using Serilog;

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
