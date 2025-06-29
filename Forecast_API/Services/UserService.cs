using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Models;
using System.Linq;

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
        // Try multiple possible subject claim names
        var authProviderId = principal.FindFirst("sub")?.Value ??
                           principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                           principal.FindFirst("user_id")?.Value ??
                           principal.FindFirst("id")?.Value;
        
        if (string.IsNullOrEmpty(authProviderId))
        {
            // Log available claims for debugging
            var availableClaims = string.Join(", ", principal.Claims.Select(c => $"{c.Type}={c.Value}"));
            _logger.LogError("No subject claim found. Available claims: {Claims}", availableClaims);
            throw new InvalidOperationException($"No subject claim found in token. Available claims: {availableClaims}");
        }

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.AuthenticationProviderId == authProviderId);

        if (existingUser != null)
        {
            return existingUser;
        }

        var email = principal.FindFirst(ClaimTypes.Email)?.Value ?? 
                   principal.FindFirst("email")?.Value;
        
        var givenName = principal.FindFirst(ClaimTypes.GivenName)?.Value ?? 
                       principal.FindFirst("given_name")?.Value;
        
        var surname = principal.FindFirst(ClaimTypes.Surname)?.Value ?? 
                     principal.FindFirst("family_name")?.Value;
        
        var name = principal.FindFirst(ClaimTypes.Name)?.Value ?? 
                  principal.FindFirst("name")?.Value ?? 
                  principal.FindFirst("preferred_username")?.Value ??
                  principal.FindFirst("username")?.Value ??
                  email?.Split('@')[0];

        // Use structured name fields if available, otherwise parse from full name
        var firstName = givenName;
        var lastName = surname;
        
        if (string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(name))
        {
            var nameParts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            firstName = nameParts.FirstOrDefault();
            lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";
        }

        var newUser = new User
        {
            UserId = Guid.NewGuid(),
            FirstName = firstName ?? "User",
            LastName = lastName ?? "",
            Email = email ?? "",
            AuthenticationProviderId = authProviderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var defaultSpace = new Space
            {
                SpaceId = Guid.NewGuid(),
                Name = $"{newUser.FirstName}'s Budget",
                OwnerId = newUser.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Spaces.Add(defaultSpace);

            var spaceMember = new SpaceMember
            {
                UserId = newUser.UserId,
                SpaceId = defaultSpace.SpaceId,
                Role = SpaceRole.Owner,
                JoinedAt = DateTime.UtcNow
            };

            _context.SpaceMembers.Add(spaceMember);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Created new user {UserId} with default space {SpaceId} for auth provider {AuthProviderId}", 
                newUser.UserId, defaultSpace.SpaceId, authProviderId);

            return newUser;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}