using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations.SqlServer;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        // Primary key
        builder.HasKey(a => a.Id);
        
        // Properties
        builder.Property(a => a.PlaidAccountId)
            .HasColumnType("varchar(100)")
            .IsRequired();
            
        builder.Property(a => a.CurrentBalance)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.AvailableBalance)
            .HasPrecision(18, 2);
            
        builder.Property(a => a.Mask)
            .HasColumnType("varchar(50)");
            
        builder.Property(a => a.Name)
            .HasColumnType("varchar(255)")
            .IsRequired();
            
        builder.Property(a => a.OfficialName)
            .HasColumnType("varchar(255)");
            
        builder.Property(a => a.Type)
            .HasColumnType("varchar(255)")
            .IsRequired();
            
        builder.Property(a => a.Subtype)
            .HasColumnType("varchar(255)");
            
        builder.Property(a => a.UserId)
            .HasColumnType("nvarchar(450)");
        
        // Relationships
        builder.HasOne(a => a.Item)
            .WithMany(i => i.Accounts)
            .HasForeignKey(a => a.ItemId)
            .IsRequired();
            
        builder.HasOne(a => a.User)
            .WithMany(u => u.Accounts)
            .HasForeignKey(a => a.UserId);
            
        builder.HasMany(a => a.Transactions)
            .WithOne(t => t.Account)
            .HasForeignKey(t => t.AccountId);
    }
}