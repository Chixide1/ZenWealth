using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ZenWealth.Core.Domain.Entities;
using ZenWealth.Infrastructure.Persistence.Configurations;

namespace ZenWealth.Infrastructure.Persistence;

/// <summary>
/// Base AppDbContext that uses the configuration factory to apply the correct database-specific configurations
/// </summary>
public class AppDbContext(
    DbContextOptions options,
    ConfigurationFactory configurationFactory)
    : IdentityDbContext<User>(options)
{
    public DbSet<Item> Items { get; set; }
    
    public DbSet<Account> Accounts { get; set; }
    
    public DbSet<Transaction> Transactions { get; set; }
    
    public DbSet<Budget> Budgets { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply configurations through the factory
        modelBuilder.ApplyConfiguration(configurationFactory.CreateAccountConfiguration());
        modelBuilder.ApplyConfiguration(configurationFactory.CreateBudgetConfiguration());
        modelBuilder.ApplyConfiguration(configurationFactory.CreateItemConfiguration());
        modelBuilder.ApplyConfiguration(configurationFactory.CreateTransactionConfiguration());
        modelBuilder.ApplyConfiguration(configurationFactory.CreateUserConfiguration());
    }
}