using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Models;
using Forecast_API.Data;
using Forecast_API.Services;

namespace Forecast_API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SpacesController : ControllerBase
    {
        private readonly CoreDbContext _context;
        private readonly IAuthorizationService _authorizationService;
        private readonly IUserService _userService;
        private readonly ILogger<SpacesController> _logger;

        public SpacesController(
            CoreDbContext context, 
            IAuthorizationService authorizationService, 
            IUserService userService,
            ILogger<SpacesController> logger)
        {
            _context = context;
            _authorizationService = authorizationService;
            _userService = userService;
            _logger = logger;
        }

        private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
        {
            var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
            return authorizationResult.Succeeded;
        }

        // GET: api/spaces
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUserSpaces()
        {
            try
            {
                var user = await _userService.GetOrCreateUserAsync(User);
                
                var spaces = await _context.SpaceMembers
                    .Where(sm => sm.UserId == user.UserId)
                    .Include(sm => sm.Space)
                    .Select(sm => new
                    {
                        sm.Space.SpaceId,
                        sm.Space.Name,
                        sm.Space.OwnerId,
                        sm.Space.CreatedAt,
                        sm.Space.UpdatedAt,
                        Role = sm.Role.ToString(),
                        JoinedAt = sm.JoinedAt
                    })
                    .ToListAsync();

                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user spaces");
                return StatusCode(500, new { error = "Failed to get spaces", details = ex.Message });
            }
        }

        // GET: api/spaces/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Space>> GetSpace(Guid id)
        {
            if (!await IsUserMemberOfSpace(id))
            {
                return Forbid();
            }

            var space = await _context.Spaces.FindAsync(id);

            if (space == null)
            {
                return NotFound();
            }

            return space;
        }

        // POST: api/spaces
        [HttpPost]
        public async Task<ActionResult<Space>> CreateSpace(CreateSpaceRequest request)
        {
            try
            {
                var user = await _userService.GetOrCreateUserAsync(User);

                var space = new Space
                {
                    SpaceId = Guid.NewGuid(),
                    Name = request.Name,
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

                return CreatedAtAction(nameof(GetSpace), new { id = space.SpaceId }, space);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating space");
                return StatusCode(500, new { error = "Failed to create space", details = ex.Message });
            }
        }

        // PUT: api/spaces/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSpace(Guid id, UpdateSpaceRequest request)
        {
            if (!await IsUserMemberOfSpace(id))
            {
                return Forbid();
            }

            var space = await _context.Spaces.FindAsync(id);
            if (space == null)
            {
                return NotFound();
            }

            // Only allow space owners to update space details
            var user = await _userService.GetOrCreateUserAsync(User);
            if (space.OwnerId != user.UserId)
            {
                return Forbid("Only space owners can update space details");
            }

            space.Name = request.Name ?? space.Name;
            space.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpaceExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/spaces/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpace(Guid id)
        {
            var space = await _context.Spaces.FindAsync(id);
            if (space == null)
            {
                return NotFound();
            }

            // Only allow space owners to delete spaces
            var user = await _userService.GetOrCreateUserAsync(User);
            if (space.OwnerId != user.UserId)
            {
                return Forbid("Only space owners can delete spaces");
            }

            try
            {
                _context.Spaces.Remove(space);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting space {SpaceId}", id);
                return StatusCode(500, new { error = "Failed to delete space", details = ex.Message });
            }
        }

        // GET: api/spaces/{id}/members
        [HttpGet("{id}/members")]
        public async Task<ActionResult<IEnumerable<object>>> GetSpaceMembers(Guid id)
        {
            if (!await IsUserMemberOfSpace(id))
            {
                return Forbid();
            }

            var members = await _context.SpaceMembers
                .Where(sm => sm.SpaceId == id)
                .Include(sm => sm.User)
                .Select(sm => new
                {
                    sm.UserId,
                    sm.User.Email,
                    sm.User.FirstName,
                    sm.User.LastName,
                    Role = sm.Role.ToString(),
                    sm.JoinedAt
                })
                .ToListAsync();

            return Ok(members);
        }

        // POST: api/spaces/{id}/members
        [HttpPost("{id}/members")]
        public async Task<ActionResult<object>> AddSpaceMember(Guid id, AddSpaceMemberRequest request)
        {
            if (!await IsUserMemberOfSpace(id))
            {
                return Forbid();
            }

            // Only space owners can add members
            var currentUser = await _userService.GetOrCreateUserAsync(User);
            var space = await _context.Spaces.FindAsync(id);
            if (space == null || space.OwnerId != currentUser.UserId)
            {
                return Forbid("Only space owners can add members");
            }

            // Find user by email
            var userToAdd = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (userToAdd == null)
            {
                return BadRequest("User with that email address not found");
            }

            // Check if user is already a member
            var existingMember = await _context.SpaceMembers
                .FirstOrDefaultAsync(sm => sm.SpaceId == id && sm.UserId == userToAdd.UserId);
            
            if (existingMember != null)
            {
                return BadRequest("User is already a member of this space");
            }

            var spaceMember = new SpaceMember
            {
                SpaceId = id,
                UserId = userToAdd.UserId,
                Role = Enum.Parse<SpaceRole>(request.Role),
                JoinedAt = DateTime.UtcNow
            };

            _context.SpaceMembers.Add(spaceMember);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSpaceMembers), new { id }, new
            {
                spaceMember.UserId,
                userToAdd.Email,
                userToAdd.FirstName,
                userToAdd.LastName,
                Role = spaceMember.Role.ToString(),
                spaceMember.JoinedAt
            });
        }

        // PUT: api/spaces/{id}/members/{userId}
        [HttpPut("{id}/members/{userId}")]
        public async Task<IActionResult> UpdateSpaceMember(Guid id, Guid userId, UpdateSpaceMemberRequest request)
        {
            if (!await IsUserMemberOfSpace(id))
            {
                return Forbid();
            }

            // Only space owners can update member roles
            var currentUser = await _userService.GetOrCreateUserAsync(User);
            var space = await _context.Spaces.FindAsync(id);
            if (space == null || space.OwnerId != currentUser.UserId)
            {
                return Forbid("Only space owners can update member roles");
            }

            var spaceMember = await _context.SpaceMembers
                .FirstOrDefaultAsync(sm => sm.SpaceId == id && sm.UserId == userId);

            if (spaceMember == null)
            {
                return NotFound();
            }

            spaceMember.Role = Enum.Parse<SpaceRole>(request.Role);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/spaces/{id}/members/{userId}
        [HttpDelete("{id}/members/{userId}")]
        public async Task<IActionResult> RemoveSpaceMember(Guid id, Guid userId)
        {
            if (!await IsUserMemberOfSpace(id))
            {
                return Forbid();
            }

            var currentUser = await _userService.GetOrCreateUserAsync(User);
            var space = await _context.Spaces.FindAsync(id);
            
            // Allow space owners to remove any member, or users to remove themselves
            if (space?.OwnerId != currentUser.UserId && currentUser.UserId != userId)
            {
                return Forbid("You can only remove yourself or you must be the space owner");
            }

            var spaceMember = await _context.SpaceMembers
                .FirstOrDefaultAsync(sm => sm.SpaceId == id && sm.UserId == userId);

            if (spaceMember == null)
            {
                return NotFound();
            }

            // Prevent removing the space owner
            if (spaceMember.Role == SpaceRole.Owner)
            {
                return BadRequest("Cannot remove space owner");
            }

            _context.SpaceMembers.Remove(spaceMember);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SpaceExists(Guid id)
        {
            return _context.Spaces.Any(e => e.SpaceId == id);
        }
    }

    // Request DTOs
    public class CreateSpaceRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateSpaceRequest
    {
        public string? Name { get; set; }
    }

    public class AddSpaceMemberRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";
    }

    public class UpdateSpaceMemberRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}