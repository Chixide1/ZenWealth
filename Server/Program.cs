using Going.Plaid;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Data.Services;
using Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Ef Core context & identity endpoints
builder.Services.AddDbContext<AppDbContext>(
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
        .EnableSensitiveDataLogging());

builder.Services.AddAuthorization();
builder.Services.AddAuthentication();

builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.User.RequireUniqueEmail = true;
});

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "dev", policy =>
    {
        policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddControllers(options => options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true);

// Model Services
builder.Services.AddScoped<ITransactionsService, TransactionsService>();
builder.Services.AddScoped<IItemsService, ItemsService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Plaid Config
builder.Services.AddPlaid(builder.Configuration.GetSection("Plaid"));
builder.Services.AddSingleton<PlaidClient>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("dev");
}

app.UseHttpsRedirection();

app.UseExceptionHandler("/error");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.MapGroup("/Identity")
    .MapIdentityApi<IdentityUser>();

app.Run();
