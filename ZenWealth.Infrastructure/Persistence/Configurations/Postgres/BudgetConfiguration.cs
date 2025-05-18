using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations.Postgres;

public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        // Primary key
        builder.HasKey(b => b.Id);
        
        // Properties
        builder.Property(b => b.UserId)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(b => b.Category)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(b => b.Limit)
            .HasColumnType("numeric(10, 2)")
            .IsRequired();
            
        builder.Property(b => b.Day)
            .IsRequired();
        
        // Relationships
        builder.HasOne(b => b.User)
            .WithMany(u => u.Budgets)
            .HasForeignKey(b => b.UserId);
    }
}