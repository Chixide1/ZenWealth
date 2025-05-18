using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZenWealth.Core.Domain.Entities;

namespace ZenWealth.Infrastructure.Persistence.Configurations.Postgres;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        // Primary key
        builder.HasKey(t => t.Id);
        
        // Indexes
        builder.HasIndex(t => t.Name);
        
        builder.HasIndex(t => t.Category);
        
        // PostgreSQL uses B-tree indexes by default, no need for clustered specification
        builder.HasIndex(t => new { t.Date, t.Id })
            .IsDescending(true, true);
            
        builder.HasIndex(t => new { t.Amount, t.Id });
        
        // Properties
        builder.Property(t => t.Name)
            .HasColumnType("text")
            .HasDefaultValue(string.Empty);
            
        builder.Property(t => t.PlaidTransactionId)
            .HasColumnType("text")
            .HasDefaultValue(string.Empty);
            
        builder.Property(t => t.UserId)
            .HasColumnType("text");
            
        builder.Property(t => t.Amount)
            .HasColumnType("numeric(18, 2)");
            
        builder.Property(t => t.IsoCurrencyCode)
            .HasColumnType("text");
            
        builder.Property(t => t.UnofficialCurrencyCode)
            .HasColumnType("text");
            
        builder.Property(t => t.MerchantName)
            .HasColumnType("text");
            
        builder.Property(t => t.LogoUrl)
            .HasColumnType("text");
            
        builder.Property(t => t.Website)
            .HasColumnType("text");
            
        builder.Property(t => t.PaymentChannel)
            .HasColumnType("text");
            
        builder.Property(t => t.Category)
            .HasColumnType("text")
            .HasDefaultValue("OTHER");
            
        builder.Property(t => t.TransactionCode)
            .HasColumnType("text");
            
        builder.Property(t => t.CategoryIconUrl)
            .HasColumnType("text");
        
        // Relationships
        builder.HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId);
            
        builder.HasOne(t => t.User)
            .WithMany(u => u.Transactions)
            .HasForeignKey(t => t.UserId);
    }
}