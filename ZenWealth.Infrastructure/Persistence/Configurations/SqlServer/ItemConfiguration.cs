using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations.SqlServer;

public class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        // Primary key
        builder.HasKey(i => i.Id);
        
        // Properties
        builder.Property(i => i.UserId)
            .HasColumnType("nvarchar(450)")
            .IsRequired();
            
        builder.Property(i => i.PlaidItemId)
            .HasColumnType("varchar(150)")
            .IsRequired();
            
        builder.Property(i => i.AccessToken)
            .HasColumnType("varchar(100)")
            .IsRequired();
            
        builder.Property(i => i.Cursor)
            .HasColumnType("varchar(255)");
            
        builder.Property(i => i.InstitutionName)
            .HasColumnType("varchar(255)")
            .IsRequired();
            
        builder.Property(i => i.InstitutionId)
            .IsRequired();
        
        // Relationships
        builder.HasOne(i => i.User)
            .WithMany(u => u.Items)
            .HasForeignKey(i => i.UserId);
            
        builder.HasMany(i => i.Accounts)
            .WithOne(a => a.Item)
            .HasForeignKey(a => a.ItemId);
    }
}