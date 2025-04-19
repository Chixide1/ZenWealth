using Going.Plaid;
using Serilog;
using Server.Services;
using Server.Utils;
using Server.Utils.Extensions;
using Server.Utils.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureDbContext(builder.Configuration);
builder.Services.ConfigureIdentity();
builder.Services.AddAuthorization();
builder.Services.AddAuthentication();
builder.Services.ConfigureCors();
builder.Services.ConfigureControllers();
builder.Services.AddScoped<IItemsService, ItemsService>();
builder.Services.AddScoped<IAccountsService, AccountsService>();
builder.Services.AddScoped<ITransactionsService, TransactionsService>();
builder.Services.AddScoped<IBudgetsService, BudgetsService>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddPlaid(builder.Configuration.GetSection("Plaid"));
builder.Services.AddSingleton<PlaidClient>();
builder.Services.ConfigureEmail(builder.Configuration);

builder.Host.UseSerilogLogging();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseSerilogRequestLogging();
app.AddEnvironmentConfiguration();
app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
