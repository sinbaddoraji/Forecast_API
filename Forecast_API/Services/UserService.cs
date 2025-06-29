using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Models;

namespace Forecast_API.Services;

public class UserService : IUserService
{
    private readonly CoreDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(CoreDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User> GetOrCreateUserAsync(ClaimsPrincipal principal)
    {
        var authProviderId = principal.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(authProviderId))
        {
            throw new InvalidOperationException("No subject claim found in token");
        }

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.AuthenticationProviderId == authProviderId);

        if (existingUser != null)
        {
            return existingUser;
        }

        var email = principal.FindFirst("email")?.Value ?? 
                   principal.FindFirst(ClaimTypes.Email)?.Value;
        
        var name = principal.FindFirst("name")?.Value ?? 
                  principal.FindFirst(ClaimTypes.Name)?.Value ?? 
                  email?.Split('@')[0];

        var newUser = new User
        {
            UserId = Guid.NewGuid(),
            FirstName = name?.Split(' ').FirstOrDefault() ?? "User",
            LastName = name?.Split(' ').Skip(1).FirstOrDefault() ?? "",
            Email = email ?? "",
            AuthenticationProviderId = authProviderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created new user {UserId} for auth provider {AuthProviderId}", 
            newUser.UserId, authProviderId);

        return newUser;
    }
}