using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations.Postgres;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        // Primary key
        builder.HasKey(a => a.Id);
        
        // Properties
        builder.Property(a => a.PlaidAccountId)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(a => a.CurrentBalance)
            .HasColumnType("numeric(18, 2)");
            
        builder.Property(a => a.AvailableBalance)
            .HasColumnType("numeric(18, 2)");
            
        builder.Property(a => a.Mask)
            .HasColumnType("text");
            
        builder.Property(a => a.Name)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(a => a.OfficialName)
            .HasColumnType("text");
            
        builder.Property(a => a.Type)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(a => a.Subtype)
            .HasColumnType("text");
            
        builder.Property(a => a.UserId)
            .HasColumnType("text");
        
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