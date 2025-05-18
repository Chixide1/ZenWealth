using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ZenWealth.Infrastructure.Persistence;
using ZenWealth.Infrastructure.Persistence.Configurations;

namespace ZenWealth.Infrastructure;

// Only used by EF Core tools for migrations, not at runtime
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Create DbContext options
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(); // Or your database provider

        // Create configuration factory
        var configFactory = new ConfigurationFactory(ConfigurationFactory.DatabaseProvider.PostgreSql);

        // Return new DbContext instance
        return new AppDbContext(optionsBuilder.Options, configFactory);
    }
}