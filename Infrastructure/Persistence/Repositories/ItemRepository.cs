using Core.Domain.Entities;
using Core.Domain.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

internal class ItemRepository(AppDbContext context) : IItemRepository
{
    public async Task<bool> ExistsForUserAsync(string userId)
    {
        return await context.Items.AnyAsync(i => i.UserId == userId);
    }

    public async Task<List<InstitutionDto>> GetInstitutionsForUserAsync(string userId)
    {
        return await context.Items
            .Where(i => i.UserId == userId)
            .Select(i => new InstitutionDto
            {
                Id = i.Id,
                Name = i.InstitutionName,
            })
            .ToListAsync();
    }

    public async Task<Item?> GetByPlaidIdAsync(string plaidItemId)
    {
        return await context.Items
            .FirstOrDefaultAsync(i => i.PlaidItemId == plaidItemId);
    }

    public async Task<Item?> GetWithAccountsByIdAndUserIdAsync(int itemId, string userId)
    {
        return await context.Items
            .Include(i => i.Accounts)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.UserId == userId);
    }

    public async Task<Item?> GetByIdAndUserIdAsync(int itemId, string userId)
    {
        return await context.Items
            .FirstOrDefaultAsync(i => i.Id == itemId && i.UserId == userId);
    }

    public async Task<ItemDetailsDto?> GetItemDetailsByPlaidIdAsync(string plaidItemId)
    {
        return await context.Items
            .Where(i => i.PlaidItemId == plaidItemId)
            .Join(
                context.Users,
                item => item.UserId,
                user => user.Id,
                (item, user) => new ItemDetailsDto
                {
                    Id = item.Id,
                    PlaidItemId = item.PlaidItemId,
                    InstitutionName = item.InstitutionName,
                    UserEmail = user.Email ?? "",
                    UserId = item.UserId
                }
            )
            .FirstOrDefaultAsync();
    }

    public async Task<List<Item>> GetItemsForUpdateAsync(string userId)
    {
        return await context.Items
            .Where(i => i.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Item> CreateAsync(Item item)
    {
        context.Items.Add(item);
        await context.SaveChangesAsync();
        return item;
    }

    public async Task UpdateAsync(Item item)
    {
        context.Items.Update(item);
        await context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(Item item)
    {
        context.Items.Remove(item);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
