using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Models;

namespace Forecast_API.Services;

public class CategoryService : ICategoryService
{
    private readonly CoreDbContext _context;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(CoreDbContext context, ILogger<CategoryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Category>> GetCategoriesAsync(Guid spaceId)
    {
        return await _context.Categories
            .Where(c => c.SpaceId == spaceId)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetCategoryByIdAsync(Guid spaceId, Guid categoryId)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId && c.SpaceId == spaceId);
    }

    public async Task<Category> CreateCategoryAsync(Guid spaceId, Category category)
    {
        try
        {
            category.SpaceId = spaceId;
            category.CategoryId = Guid.NewGuid();
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;

            // Validate color format if provided
            if (!string.IsNullOrEmpty(category.Color) && !IsValidHexColor(category.Color))
            {
                throw new ArgumentException("Color must be a valid hex color (e.g., #FF5733)");
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created category {CategoryId} for space {SpaceId}", category.CategoryId, spaceId);
            return category;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category for space {SpaceId}", spaceId);
            throw;
        }
    }

    public async Task<Category?> UpdateCategoryAsync(Guid spaceId, Guid categoryId, Category category)
    {
        try
        {
            var existingCategory = await GetCategoryByIdAsync(spaceId, categoryId);
            if (existingCategory == null)
            {
                return null;
            }

            // Validate color format if provided
            if (!string.IsNullOrEmpty(category.Color) && !IsValidHexColor(category.Color))
            {
                throw new ArgumentException("Color must be a valid hex color (e.g., #FF5733)");
            }

            existingCategory.Name = category.Name;
            existingCategory.Color = category.Color;
            existingCategory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated category {CategoryId} for space {SpaceId}", categoryId, spaceId);
            return existingCategory;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId} for space {SpaceId}", categoryId, spaceId);
            throw;
        }
    }

    public async Task<bool> DeleteCategoryAsync(Guid spaceId, Guid categoryId)
    {
        try
        {
            var category = await GetCategoryByIdAsync(spaceId, categoryId);
            if (category == null)
            {
                return false;
            }

            // Check if category has associated expenses
            if (await CategoryHasExpensesAsync(categoryId))
            {
                throw new InvalidOperationException("Cannot delete category with associated expenses");
            }

            // Check if category has associated budgets
            if (await CategoryHasBudgetsAsync(categoryId))
            {
                throw new InvalidOperationException("Cannot delete category with associated budgets");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted category {CategoryId} from space {SpaceId}", categoryId, spaceId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId} from space {SpaceId}", categoryId, spaceId);
            throw;
        }
    }

    public async Task<bool> CategoryHasExpensesAsync(Guid categoryId)
    {
        return await _context.Expenses.AnyAsync(e => e.CategoryId == categoryId);
    }

    public async Task<bool> CategoryHasBudgetsAsync(Guid categoryId)
    {
        return await _context.Budgets.AnyAsync(b => b.CategoryId == categoryId);
    }

    public async Task<Dictionary<Guid, decimal>> GetCategoryExpenseTotals(Guid spaceId, DateTime startDate, DateTime endDate)
    {
        return await _context.Expenses
            .Where(e => e.SpaceId == spaceId && 
                       e.Date >= startDate && 
                       e.Date <= endDate)
            .GroupBy(e => e.CategoryId)
            .Select(g => new { CategoryId = g.Key, Total = g.Sum(e => e.Amount) })
            .ToDictionaryAsync(x => x.CategoryId, x => x.Total);
    }

    public async Task<IEnumerable<Category>> GetCategoriesWithUsageStatsAsync(Guid spaceId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Categories
            .Where(c => c.SpaceId == spaceId)
            .Include(c => c.Expenses.Where(e => 
                (!startDate.HasValue || e.Date >= startDate.Value) &&
                (!endDate.HasValue || e.Date <= endDate.Value)))
            .Include(c => c.Budgets);

        var categories = await query.ToListAsync();

        return categories.OrderBy(c => c.Name);
    }

    private static bool IsValidHexColor(string color)
    {
        if (string.IsNullOrEmpty(color))
            return false;

        // Check if it starts with # and has 6 hex characters
        if (color.Length != 7 || !color.StartsWith("#"))
            return false;

        // Check if all characters after # are valid hex
        return color.Substring(1).All(c => "0123456789ABCDEFabcdef".Contains(c));
    }
}