using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ZenWealth.Core.Application.Interfaces;
using ZenWealth.Core.Application.Services;

namespace ZenWealth.Core
{
    public static class DependencyInjection
    {
        /// <summary>
        /// Register Services for dependency injection
        /// </summary>
        public static void AddServices(this IServiceCollection services)
        {
            services.AddScoped<IAccountsService, AccountService>();
            services.AddScoped<IBudgetsService, BudgetService>();
            services.AddScoped<ITransactionsService, TransactionService>();
            services.AddScoped<IItemsService, ItemService>();
        }
    }
}
