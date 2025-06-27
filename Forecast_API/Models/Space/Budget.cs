using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Forecast_API.Models;

public sealed class Budget
{
    [Key]
    public Guid BudgetId { get; set; }
    
    [Required]
    [ForeignKey(nameof(Space))]
    public Guid SpaceId { get; set; }
    
    [Required]
    [ForeignKey(nameof(Category))]
    public Guid CategoryId { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Space Space { get; set; } = null!;
    public Category Category { get; set; } = null!;
}