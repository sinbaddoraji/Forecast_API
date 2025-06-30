using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Services;

namespace Forecast_API.Authorization;

public class SpaceMemberAuthorizationHandler : AuthorizationHandler<SpaceMemberRequirement, Guid>
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SpaceMemberAuthorizationHandler> _logger;

    public SpaceMemberAuthorizationHandler(
        IServiceProvider serviceProvider,
        ILogger<SpaceMemberAuthorizationHandler> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        SpaceMemberRequirement requirement,
        Guid spaceId)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CoreDbContext>();
        var userService = scope.ServiceProvider.GetRequiredService<IUserService>();

        if (context.User?.Identity?.IsAuthenticated != true)
        {
            _logger.LogWarning("User is not authenticated");
            return;
        }

        try
        {
            var user = await userService.GetOrCreateUserAsync(context.User);
            
            _logger.LogInformation("Checking authorization for user {UserId} ({Email}) on space {SpaceId}", 
                user.UserId, user.Email, spaceId);
            
            var isMember = await dbContext.SpaceMembers
                .AnyAsync(sm => sm.SpaceId == spaceId && sm.UserId == user.UserId);

            if (isMember)
            {
                context.Succeed(requirement);
                _logger.LogInformation("User {UserId} authorized for space {SpaceId}", user.UserId, spaceId);
            }
            else
            {
                // Log more details about the failure
                var userSpaces = await dbContext.SpaceMembers
                    .Where(sm => sm.UserId == user.UserId)
                    .Select(sm => sm.SpaceId)
                    .ToListAsync();
                
                _logger.LogWarning("User {UserId} is not a member of space {SpaceId}. User is member of spaces: {UserSpaces}", 
                    user.UserId, spaceId, string.Join(", ", userSpaces));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking space membership");
        }
    }
}