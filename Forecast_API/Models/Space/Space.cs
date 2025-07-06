using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Forecast_API.Models;

public sealed class Space
{
    [Key]
    public Guid SpaceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [ForeignKey(nameof(Owner))]
    public Guid OwnerId { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "USD";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<SpaceMember> Members { get; set; } = new List<SpaceMember>();
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Income> Incomes { get; set; } = new List<Income>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<SavingsGoal> SavingsGoals { get; set; } = new List<SavingsGoal>();
}