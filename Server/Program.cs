using Going.Plaid;
using Server.Common;
using Server.Data.Models;
using Server.Extensions;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureDbContext(builder.Configuration);
builder.Services.ConfigureIdentity();
builder.Services.AddAuthorization();
builder.Services.AddAuthentication();
builder.Services.ConfigureCors();
builder.Services.AddControllers();
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

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.AddEnvironmentConfiguration();
app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");
// app.MapGroup("/Identity").MapIdentityApi<User>();

app.Run();
