using Forecast_API.Models;

namespace Forecast_API.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetCategoriesAsync(Guid spaceId);
    Task<Category?> GetCategoryByIdAsync(Guid spaceId, Guid categoryId);
    Task<Category> CreateCategoryAsync(Guid spaceId, Category category);
    Task<Category?> UpdateCategoryAsync(Guid spaceId, Guid categoryId, Category category);
    Task<bool> DeleteCategoryAsync(Guid spaceId, Guid categoryId);
    Task<bool> CategoryHasExpensesAsync(Guid categoryId);
    Task<bool> CategoryHasBudgetsAsync(Guid categoryId);
    Task<Dictionary<Guid, decimal>> GetCategoryExpenseTotals(Guid spaceId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<Category>> GetCategoriesWithUsageStatsAsync(Guid spaceId, DateTime? startDate = null, DateTime? endDate = null);
}