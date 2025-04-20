using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Server.Data.Entities;
using Server.Data.Models;

namespace Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<User>(options)
{
    public DbSet<Item> Items { get; set; }
    
    public DbSet<Account> Accounts { get; set; }
    
    public DbSet<Transaction> Transactions { get; set; }
    
    public DbSet<Budget> Budgets { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaction>()
            .HasKey(t => t.Id)
            .IsClustered(false);
        
        modelBuilder.Entity<Transaction>()
            .HasIndex(t => new { t.Date, t.Id })
            .IsDescending([true, true])
            .IsClustered();

        modelBuilder.Entity<Transaction>()
            .HasIndex(t => new { t.Amount, t.Id })
            .IsUnique();
        
        base.OnModelCreating(modelBuilder);
    }
}