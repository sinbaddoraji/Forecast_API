using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Forecast_API.Models;

public sealed class SpaceMember
{
    [Key, Column(Order = 1)]
    [ForeignKey(nameof(User))]
    public Guid UserId { get; set; }
    
    [Key, Column(Order = 2)]
    [ForeignKey(nameof(Space))]
    public Guid SpaceId { get; set; }
    
    [Required]
    public SpaceRole Role { get; set; } = SpaceRole.Member;
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Space Space { get; set; } = null!;
}

