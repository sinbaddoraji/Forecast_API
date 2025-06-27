using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Forecast_API.Models;

public sealed class SavingsGoal
{
    [Key]
    public Guid GoalId { get; set; }
    
    [Required]
    [ForeignKey(nameof(Space))]
    public Guid SpaceId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TargetAmount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentAmount { get; set; } = 0;
    
    public DateTime? TargetDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Space Space { get; set; } = null!;
    
    // Calculated property
    [NotMapped]
    public decimal ProgressPercentage => TargetAmount > 0 ? (CurrentAmount / TargetAmount) * 100 : 0;
    
    [NotMapped]
    public bool IsCompleted => CurrentAmount >= TargetAmount;
}