using System.ComponentModel.DataAnnotations;

namespace Forecast_API.Models.DTOs;

public class CreateAccountDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Type { get; set; } = string.Empty;
    
    [Range(-999999999.99, 999999999.99)]
    public decimal StartingBalance { get; set; }
}

public class UpdateAccountDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Type { get; set; } = string.Empty;
    
    [Range(-999999999.99, 999999999.99)]
    public decimal CurrentBalance { get; set; }
}