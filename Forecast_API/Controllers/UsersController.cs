using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Models;
using Forecast_API.Services;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        CoreDbContext context,
        IUserService userService,
        ILogger<UsersController> logger)
    {
        _context = context;
        _userService = userService;
        _logger = logger;
    }

    // GET: api/users/me
    [HttpGet("me")]
    public async Task<ActionResult<object>> GetCurrentUser()
    {
        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);
            
            return Ok(new
            {
                user.UserId,
                user.Email,
                user.FirstName,
                user.LastName,
                user.CreatedAt,
                user.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new { error = "Failed to get user information" });
        }
    }

    // PUT: api/users/me
    [HttpPut("me")]
    public async Task<IActionResult> UpdateCurrentUser(UpdateUserProfileRequest request)
    {
        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);

            // Update user properties
            if (!string.IsNullOrWhiteSpace(request.FirstName))
                user.FirstName = request.FirstName.Trim();
            
            if (!string.IsNullOrWhiteSpace(request.LastName))
                user.LastName = request.LastName.Trim();

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                // Check if email is already taken by another user
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.UserId != user.UserId);
                
                if (existingUser != null)
                {
                    return BadRequest(new { error = "Email address is already in use" });
                }
                
                user.Email = request.Email.Trim().ToLowerInvariant();
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return StatusCode(500, new { error = "Failed to update user profile" });
        }
    }

    // GET: api/users/me/spaces
    [HttpGet("me/spaces")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserSpaces()
    {
        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);
            
            var spaces = await _context.SpaceMembers
                .Where(sm => sm.UserId == user.UserId)
                .Include(sm => sm.Space)
                .ThenInclude(s => s.Owner)
                .Select(sm => new
                {
                    sm.Space.SpaceId,
                    sm.Space.Name,
                    sm.Space.OwnerId,
                    OwnerName = $"{sm.Space.Owner.FirstName} {sm.Space.Owner.LastName}".Trim(),
                    sm.Space.CreatedAt,
                    UserRole = sm.Role.ToString(),
                    sm.JoinedAt,
                    MemberCount = sm.Space.Members.Count()
                })
                .OrderByDescending(s => s.JoinedAt)
                .ToListAsync();

            return Ok(spaces);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user spaces");
            return StatusCode(500, new { error = "Failed to get user spaces" });
        }
    }

    // GET: api/users/search
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<object>>> SearchUsers([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { error = "Email parameter is required" });
        }

        try
        {
            // Only return basic info for privacy - no sensitive data
            var users = await _context.Users
                .Where(u => u.Email.ToLower().Contains(email.ToLower().Trim()))
                .Take(10) // Limit results
                .Select(u => new
                {
                    u.UserId,
                    u.Email,
                    u.FirstName,
                    u.LastName
                })
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users with email: {Email}", email);
            return StatusCode(500, new { error = "Failed to search users" });
        }
    }

    // DELETE: api/users/me
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteCurrentUser()
    {
        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);

            // Check if user owns any spaces with other members
            var ownedSpacesWithMembers = await _context.Spaces
                .Where(s => s.OwnerId == user.UserId)
                .Include(s => s.Members)
                .Where(s => s.Members.Count > 1)
                .ToListAsync();

            if (ownedSpacesWithMembers.Any())
            {
                return BadRequest(new { 
                    error = "Cannot delete account while owning spaces with other members", 
                    details = "Please transfer ownership or remove other members from your spaces first" 
                });
            }

            // Remove user and all associated data (cascade delete handles related records)
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} deleted their account", user.UserId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user account");
            return StatusCode(500, new { error = "Failed to delete user account" });
        }
    }

    // GET: api/users/me/activity
    [HttpGet("me/activity")]
    public async Task<ActionResult<object>> GetUserActivity()
    {
        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);

            // Get recent activity across all user spaces
            var recentExpenses = await _context.Expenses
                .Where(e => e.AddedByUserId == user.UserId)
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .Select(e => new
                {
                    Type = "Expense",
                    e.Amount,
                    Description = e.Title,
                    e.Date,
                    e.CreatedAt,
                    SpaceName = e.Space.Name
                })
                .ToListAsync();

            var recentIncomes = await _context.Incomes
                .Where(i => i.AddedByUserId == user.UserId)
                .OrderByDescending(i => i.CreatedAt)
                .Take(5)
                .Select(i => new
                {
                    Type = "Income",
                    i.Amount,
                    Description = i.Title,
                    i.Date,
                    i.CreatedAt,
                    SpaceName = i.Space.Name
                })
                .ToListAsync();

            var totalSpaces = await _context.SpaceMembers
                .Where(sm => sm.UserId == user.UserId)
                .CountAsync();

            var totalExpenses = await _context.Expenses
                .Where(e => e.AddedByUserId == user.UserId)
                .CountAsync();

            var totalIncomes = await _context.Incomes
                .Where(i => i.AddedByUserId == user.UserId)
                .CountAsync();

            return Ok(new
            {
                RecentExpenses = recentExpenses,
                RecentIncomes = recentIncomes,
                Statistics = new
                {
                    TotalSpaces = totalSpaces,
                    TotalExpenses = totalExpenses,
                    TotalIncomes = totalIncomes
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user activity");
            return StatusCode(500, new { error = "Failed to get user activity" });
        }
    }
}

// Request DTOs
public class UpdateUserProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
}