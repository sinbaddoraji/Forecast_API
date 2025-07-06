using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Forecast_API.Models;

public enum SavingsGoalTransactionType
{
    Contribution,
    Withdrawal
}

public sealed class SavingsGoalTransaction
{
    [Key]
    public Guid TransactionId { get; set; }
    
    [Required]
    [ForeignKey(nameof(SavingsGoal))]
    public Guid GoalId { get; set; }
    
    [Required]
    [ForeignKey(nameof(Space))]
    public Guid SpaceId { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    public SavingsGoalTransactionType Type { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public SavingsGoal? SavingsGoal { get; set; }
    public Space? Space { get; set; }
}