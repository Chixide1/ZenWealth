using Core.Interfaces;
using Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Core.Utils.Extensions;

public static class ServiceExtensions
{
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
}