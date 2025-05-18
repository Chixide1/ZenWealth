using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations.Postgres;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // ASP.NET Identity uses Guid as string for User ID in PostgreSQL
        builder.Property(u => u.Id)
            .HasColumnType("text");
            
        // Relationships
        builder.HasMany(u => u.Items)
            .WithOne(i => i.User)
            .HasForeignKey(i => i.UserId);
            
        builder.HasMany(u => u.Accounts)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId);
            
        builder.HasMany(u => u.Transactions)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId);
            
        builder.HasMany(u => u.Budgets)
            .WithOne(b => b.User)
            .HasForeignKey(b => b.UserId);
    }
}