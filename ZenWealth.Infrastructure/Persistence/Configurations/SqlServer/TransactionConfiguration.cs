using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations.SqlServer;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        // Primary key
        builder.HasKey(t => t.Id)
            .IsClustered(false);
            
        // Indexes
        builder.HasIndex(t => t.Name);
        
        builder.HasIndex(t => t.Category);
        
        builder.HasIndex(t => new { t.Date, t.Id })
            .IsDescending(true, true)
            .IsClustered();
            
        builder.HasIndex(t => new { t.Amount, t.Id })
            .IsUnique();
        
        // Properties
        builder.Property(t => t.Name)
            .HasColumnType("varchar(255)")
            .HasDefaultValue(string.Empty);
            
        builder.Property(t => t.PlaidTransactionId)
            .HasColumnType("varchar(100)")
            .HasDefaultValue(string.Empty);
            
        builder.Property(t => t.UserId)
            .HasColumnType("nvarchar(450)");
            
        builder.Property(t => t.Amount)
            .HasPrecision(18, 2);
            
        builder.Property(t => t.IsoCurrencyCode)
            .HasColumnType("varchar(255)");
            
        builder.Property(t => t.UnofficialCurrencyCode)
            .HasColumnType("varchar(255)");
            
        builder.Property(t => t.MerchantName)
            .HasColumnType("varchar(255)");
            
        builder.Property(t => t.LogoUrl)
            .HasColumnType("varchar(255)");
            
        builder.Property(t => t.Website)
            .HasColumnType("varchar(255)");
            
        builder.Property(t => t.PaymentChannel)
            .HasColumnType("varchar(255)");
            
        builder.Property(t => t.Category)
            .HasColumnType("varchar(255)")
            .HasDefaultValue("OTHER");
            
        builder.Property(t => t.TransactionCode)
            .HasColumnType("varchar(255)");
            
        builder.Property(t => t.CategoryIconUrl)
            .HasColumnType("varchar(255)");
        
        // Relationships
        builder.HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId);
            
        builder.HasOne(t => t.User)
            .WithMany(u => u.Transactions)
            .HasForeignKey(t => t.UserId);
    }
}