using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations;

/// <summary>
/// Factory that creates the appropriate database-specific configurations
/// </summary>
public class ConfigurationFactory(ConfigurationFactory.DatabaseProvider databaseProvider)
{
    public enum DatabaseProvider
    {
        SqlServer,
        PostgreSql
    }

    /// <summary>
    /// Creates the appropriate configuration for the Account entity based on the selected database provider
    /// </summary>
    public IEntityTypeConfiguration<Account> CreateAccountConfiguration()
    {
        return databaseProvider switch
        {
            DatabaseProvider.SqlServer => new SqlServer.AccountConfiguration(),
            DatabaseProvider.PostgreSql => new Postgres.AccountConfiguration(),
            _ => throw new ArgumentOutOfRangeException(nameof(databaseProvider))
        };
    }
    
    /// <summary>
    /// Creates the appropriate configuration for the Budget entity based on the selected database provider
    /// </summary>
    public IEntityTypeConfiguration<Budget> CreateBudgetConfiguration()
    {
        return databaseProvider switch
        {
            DatabaseProvider.SqlServer => new SqlServer.BudgetConfiguration(),
            DatabaseProvider.PostgreSql => new Postgres.BudgetConfiguration(),
            _ => throw new ArgumentOutOfRangeException(nameof(databaseProvider))
        };
    }
    
    /// <summary>
    /// Creates the appropriate configuration for the Item entity based on the selected database provider
    /// </summary>
    public IEntityTypeConfiguration<Item> CreateItemConfiguration()
    {
        return databaseProvider switch
        {
            DatabaseProvider.SqlServer => new SqlServer.ItemConfiguration(),
            DatabaseProvider.PostgreSql => new Postgres.ItemConfiguration(),
            _ => throw new ArgumentOutOfRangeException(nameof(databaseProvider))
        };
    }
    
    /// <summary>
    /// Creates the appropriate configuration for the Transaction entity based on the selected database provider
    /// </summary>
    public IEntityTypeConfiguration<Transaction> CreateTransactionConfiguration()
    {
        return databaseProvider switch
        {
            DatabaseProvider.SqlServer => new SqlServer.TransactionConfiguration(),
            DatabaseProvider.PostgreSql => new Postgres.TransactionConfiguration(),
            _ => throw new ArgumentOutOfRangeException(nameof(databaseProvider))
        };
    }
    
    /// <summary>
    /// Creates the appropriate configuration for the User entity based on the selected database provider
    /// </summary>
    public IEntityTypeConfiguration<User> CreateUserConfiguration()
    {
        return databaseProvider switch
        {
            DatabaseProvider.SqlServer => new SqlServer.UserConfiguration(),
            DatabaseProvider.PostgreSql => new Postgres.UserConfiguration(),
            _ => throw new ArgumentOutOfRangeException(nameof(databaseProvider))
        };
    }
}