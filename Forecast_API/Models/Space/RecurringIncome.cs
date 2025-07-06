using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Forecast_API.Models;

public sealed class RecurringIncome
{
    [Key]
    public Guid RecurringIncomeId { get; set; }
    
    [Required]
    [ForeignKey(nameof(Space))]
    public Guid SpaceId { get; set; }
    
    [Required]
    [ForeignKey(nameof(Account))]
    public Guid AccountId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    [Required]
    public RecurrenceFrequency Frequency { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [Required]
    public DateTime NextDueDate { get; set; }
    
    public DateTime? LastGeneratedDate { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    [Required]
    [ForeignKey(nameof(CreatedByUser))]
    public Guid CreatedByUserId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Space Space { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
}