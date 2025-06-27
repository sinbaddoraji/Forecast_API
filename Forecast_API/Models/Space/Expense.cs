using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Forecast_API.Models;

public sealed class Expense
{
    [Key]
    public Guid ExpenseId { get; set; }
    
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
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    [ForeignKey(nameof(AddedByUser))]
    public Guid AddedByUserId { get; set; }
    
    [Required]
    [ForeignKey(nameof(Category))]
    public Guid CategoryId { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Space Space { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public User AddedByUser { get; set; } = null!;
    public Category Category { get; set; } = null!;
}