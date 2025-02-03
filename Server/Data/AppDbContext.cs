using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Server.Data.Models;

namespace Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<User>(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaction>()
            .HasKey(t => new { t.Date, t.Id })
            .IsClustered(false);
        
        modelBuilder.Entity<Transaction>()
            .HasIndex(t => new {t.Date, t.Id})
            .IsDescending([true, false])
            .IsClustered();
        
        base.OnModelCreating(modelBuilder);
    }
    
    public DbSet<Item> Items { get; set; }
    
    public DbSet<Account> Accounts { get; set; }
    
    public DbSet<Transaction> Transactions { get; set; }
}