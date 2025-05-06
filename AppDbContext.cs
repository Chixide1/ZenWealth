// Api.Data/Context/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using Server.Core.Entities;

namespace Server.Data.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        
        // Other DbSets
    }
}

// Api.Data/Repositories/Repository.cs
using Microsoft.EntityFrameworkCore;
using Server.Core.Interfaces;
using Server.Data.Context;

namespace Server.Data.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        
        public Repository(AppDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }
        
        // Implement other methods
    }
}