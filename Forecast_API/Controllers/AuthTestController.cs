using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Forecast_API.Services;
using Forecast_API.Data;
using Forecast_API.Models;
using Microsoft.EntityFrameworkCore;

namespace Forecast_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthTestController : ControllerBase
{
    private readonly ILogger<AuthTestController> _logger;
    private readonly IAuthorizationService _authorizationService;
    private readonly IUserService _userService;
    private readonly CoreDbContext _context;

    public AuthTestController(
        ILogger<AuthTestController> logger,
        IAuthorizationService authorizationService,
        IUserService userService,
        CoreDbContext context)
    {
        _logger = logger;
        _authorizationService = authorizationService;
        _userService = userService;
        _context = context;
    }

    [HttpGet("public")]
    public IActionResult PublicEndpoint()
    {
        return Ok(new { message = "This is a public endpoint" });
    }

    [HttpGet("protected")]
    [Authorize]
    public IActionResult ProtectedEndpoint()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Ok(new 
        { 
            message = "This is a protected endpoint",
            userId = User.Identity?.Name,
            claims = claims
        });
    }

    [HttpGet("space/{spaceId}")]
    [Authorize]
    public async Task<IActionResult> SpaceProtectedEndpoint(Guid spaceId)
    {
        try
        {
            // Get the current user first
            var user = await _userService.GetOrCreateUserAsync(User);
            
            _logger.LogInformation("Space access attempt - User: {UserId}, Space: {SpaceId}", user.UserId, spaceId);
            
            // Use resource-based authorization
            var authResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
            
            if (!authResult.Succeeded)
            {
                _logger.LogWarning("Authorization failed for user {UserId} ({Email}) on space {SpaceId}", 
                    user.UserId, user.Email, spaceId);
                
                // Get user's actual spaces for debugging
                var userSpaces = await _context.SpaceMembers
                    .Where(sm => sm.UserId == user.UserId)
                    .Include(sm => sm.Space)
                    .Select(sm => new { sm.SpaceId, sm.Space.Name })
                    .ToListAsync();
                
                return StatusCode(403, new 
                {
                    error = "Access denied",
                    message = "You are not a member of this space",
                    requestedSpace = spaceId,
                    userId = user.UserId,
                    userSpaces = userSpaces
                });
            }

            return Ok(new 
            { 
                message = "This endpoint requires space membership",
                spaceId = spaceId,
                userId = user.UserId,
                userEmail = user.Email
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in space protected endpoint");
            return StatusCode(500, new { error = "Internal server error", details = ex.Message });
        }
    }

    [HttpGet("debug")]
    [Authorize]
    public async Task<IActionResult> DebugUserInfo()
    {
        try
        {
            // Get or create the user
            var user = await _userService.GetOrCreateUserAsync(User);
            
            // Get user's spaces
            var spaces = await _context.SpaceMembers
                .Where(sm => sm.UserId == user.UserId)
                .Include(sm => sm.Space)
                .Select(sm => new
                {
                    sm.SpaceId,
                    sm.Space.Name,
                    sm.Role,
                    sm.JoinedAt
                })
                .ToListAsync();

            var claims = User.Claims.Select(c => new { c.Type, c.Value });
            
            return Ok(new
            {
                message = "User debug information",
                user = new
                {
                    user.UserId,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    FullName = $"{user.FirstName} {user.LastName}",
                    user.AuthenticationProviderId
                },
                spaces = spaces,
                claims = claims
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting debug info");
            return StatusCode(500, new { error = "Error getting debug info", details = ex.Message });
        }
    }

    [HttpGet("diagnose/{testId}")]
    [Authorize]
    public async Task<IActionResult> DiagnoseRouting(Guid testId)
    {
        var user = await _userService.GetOrCreateUserAsync(User);
        
        return Ok(new
        {
            message = "Routing diagnosis",
            passedParameter = testId,
            passedParameterType = testId.GetType().Name,
            userId = user.UserId,
            userIdType = user.UserId.GetType().Name,
            areEqual = testId == user.UserId,
            rawUrl = Request.Path.Value,
            routeValues = Request.RouteValues
        });
    }

    [HttpPost("create-test-space")]
    [Authorize]
    public async Task<IActionResult> CreateTestSpace()
    {
        try
        {
            // Get or create the user
            var user = await _userService.GetOrCreateUserAsync(User);
            
            // Create a new space
            var space = new Space
            {
                SpaceId = Guid.NewGuid(),
                Name = $"Test Space for {user.FirstName} {user.LastName}",
                OwnerId = user.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Spaces.Add(space);

            // Add the user as an owner member of the space
            var spaceMember = new SpaceMember
            {
                SpaceId = space.SpaceId,
                UserId = user.UserId,
                Role = SpaceRole.Owner,
                JoinedAt = DateTime.UtcNow
            };

            _context.SpaceMembers.Add(spaceMember);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Test space created successfully",
                space = new
                {
                    space.SpaceId,
                    space.Name
                },
                membership = new
                {
                    spaceMember.Role,
                    spaceMember.JoinedAt
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating test space");
            return StatusCode(500, new { error = "Error creating test space", details = ex.Message });
        }
    }
}