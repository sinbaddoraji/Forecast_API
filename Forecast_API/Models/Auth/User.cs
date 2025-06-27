using System.ComponentModel.DataAnnotations;

namespace Forecast_API.Models;

public sealed class User
{
    [Key]
    public Guid UserId { get; set; }
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string AuthenticationProviderId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Space> OwnedSpaces { get; set; } = new List<Space>();
    public ICollection<SpaceMember> SpaceMemberships { get; set; } = new List<SpaceMember>();
    public ICollection<Expense> AddedExpenses { get; set; } = new List<Expense>();
    public ICollection<Income> AddedIncomes { get; set; } = new List<Income>();
}