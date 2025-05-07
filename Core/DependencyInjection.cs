using Core.Application.Interfaces;
using Core.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core
{
    public static class DependencyInjection
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
}
