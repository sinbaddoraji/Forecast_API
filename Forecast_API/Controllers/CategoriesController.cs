using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Models.DTOs;
using Forecast_API.Services;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly IAuthorizationService _authorizationService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(
        ICategoryService categoryService,
        IAuthorizationService authorizationService,
        ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _authorizationService = authorizationService;
        _logger = logger;
    }

    private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
        return authorizationResult.Succeeded;
    }

    private static CategoryResponseDto MapToResponseDto(Category category, int expenseCount = 0, decimal totalExpenses = 0, bool hasBudgets = false)
    {
        return new CategoryResponseDto
        {
            CategoryId = category.CategoryId,
            SpaceId = category.SpaceId,
            Name = category.Name,
            Color = category.Color,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt,
            ExpenseCount = expenseCount,
            TotalExpenses = totalExpenses,
            HasBudgets = hasBudgets
        };
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetCategories(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var categories = await _categoryService.GetCategoriesAsync(spaceId);
            var responseDtos = categories.Select(c => MapToResponseDto(c));
            return Ok(responseDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving categories");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryResponseDto>> GetCategory(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var category = await _categoryService.GetCategoryByIdAsync(spaceId, id);
            if (category == null)
            {
                return NotFound();
            }

            var expenseCount = category.Expenses?.Count ?? 0;
            var totalExpenses = category.Expenses?.Sum(e => e.Amount) ?? 0;
            var hasBudgets = category.Budgets?.Any() ?? false;

            return Ok(MapToResponseDto(category, expenseCount, totalExpenses, hasBudgets));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category {CategoryId} for space {SpaceId}", id, spaceId);
            return StatusCode(500, "An error occurred while retrieving the category");
        }
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponseDto>> PostCategory(Guid spaceId, CreateCategoryDto createDto)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var category = new Category
            {
                Name = createDto.Name,
                Color = createDto.Color
            };

            var createdCategory = await _categoryService.CreateCategoryAsync(spaceId, category);
            var responseDto = MapToResponseDto(createdCategory);

            return CreatedAtAction(
                nameof(GetCategory),
                new { spaceId = spaceId, id = createdCategory.CategoryId },
                responseDto);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid data while creating category for space {SpaceId}", spaceId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while creating the category");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategory(Guid spaceId, Guid id, UpdateCategoryDto updateDto)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var category = new Category
            {
                CategoryId = id,
                Name = updateDto.Name,
                Color = updateDto.Color
            };

            var updatedCategory = await _categoryService.UpdateCategoryAsync(spaceId, id, category);
            if (updatedCategory == null)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid data while updating category {CategoryId} for space {SpaceId}", id, spaceId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId} for space {SpaceId}", id, spaceId);
            return StatusCode(500, "An error occurred while updating the category");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var deleted = await _categoryService.DeleteCategoryAsync(spaceId, id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot delete category {CategoryId} for space {SpaceId}", id, spaceId);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId} from space {SpaceId}", id, spaceId);
            return StatusCode(500, "An error occurred while deleting the category");
        }
    }

    [HttpGet("usage-stats")]
    public async Task<ActionResult<IEnumerable<CategoryUsageStatsDto>>> GetCategoryUsageStats(
        Guid spaceId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var categories = await _categoryService.GetCategoriesWithUsageStatsAsync(spaceId, startDate, endDate);
            var currentMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var currentMonthEnd = currentMonthStart.AddMonths(1).AddDays(-1);

            var usageStats = categories.Select(c => new CategoryUsageStatsDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Color = c.Color,
                ExpenseCount = c.Expenses?.Count ?? 0,
                TotalExpenses = c.Expenses?.Sum(e => e.Amount) ?? 0,
                CurrentMonthExpenses = c.Expenses?
                    .Where(e => e.Date >= currentMonthStart && e.Date <= currentMonthEnd)
                    .Sum(e => e.Amount) ?? 0,
                HasBudgets = c.Budgets?.Any() ?? false,
                BudgetAmount = c.Budgets?.FirstOrDefault()?.Amount,
                BudgetRemaining = c.Budgets?.FirstOrDefault()?.Amount - 
                    (c.Expenses?
                        .Where(e => e.Date >= currentMonthStart && e.Date <= currentMonthEnd)
                        .Sum(e => e.Amount) ?? 0)
            });

            return Ok(usageStats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category usage stats for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving category usage statistics");
        }
    }

    [HttpGet("expense-totals")]
    public async Task<ActionResult<Dictionary<Guid, decimal>>> GetCategoryExpenseTotals(
        Guid spaceId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var totals = await _categoryService.GetCategoryExpenseTotals(spaceId, startDate, endDate);
            return Ok(totals);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category expense totals for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving category expense totals");
        }
    }
}