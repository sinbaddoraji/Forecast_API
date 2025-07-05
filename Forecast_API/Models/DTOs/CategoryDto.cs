using System.ComponentModel.DataAnnotations;

namespace Forecast_API.Models.DTOs;

public class CreateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "Color must be a valid hex color (e.g., #FF5733)")]
    public string? Color { get; set; }
}

public class UpdateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "Color must be a valid hex color (e.g., #FF5733)")]
    public string? Color { get; set; }
}

public class CategoryResponseDto
{
    public Guid CategoryId { get; set; }
    public Guid SpaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int ExpenseCount { get; set; }
    public decimal TotalExpenses { get; set; }
    public bool HasBudgets { get; set; }
}

public class CategoryUsageStatsDto
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public int ExpenseCount { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal CurrentMonthExpenses { get; set; }
    public bool HasBudgets { get; set; }
    public decimal? BudgetAmount { get; set; }
    public decimal? BudgetRemaining { get; set; }
}