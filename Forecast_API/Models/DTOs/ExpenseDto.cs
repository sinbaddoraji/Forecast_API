using System.ComponentModel.DataAnnotations;

namespace Forecast_API.Models.DTOs;

public class CreateExpenseDto
{
    [Required]
    public Guid AccountId { get; set; }
    
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 999999999.99)]
    public decimal Amount { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public Guid CategoryId { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
}

public class UpdateExpenseDto
{
    [Required]
    public Guid AccountId { get; set; }
    
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 999999999.99)]
    public decimal Amount { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public Guid CategoryId { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
}

public class ExpenseResponseDto
{
    public Guid ExpenseId { get; set; }
    public Guid SpaceId { get; set; }
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public Guid AddedByUserId { get; set; }
    public string AddedByUserName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ExpenseFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? AccountId { get; set; }
    public int? Limit { get; set; } = 100;
}