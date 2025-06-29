using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forecast_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthTestController : ControllerBase
{
    private readonly ILogger<AuthTestController> _logger;

    public AuthTestController(ILogger<AuthTestController> logger)
    {
        _logger = logger;
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
    [Authorize(Policy = "IsSpaceMember")]
    public IActionResult SpaceProtectedEndpoint(Guid spaceId)
    {
        return Ok(new 
        { 
            message = "This endpoint requires space membership",
            spaceId = spaceId,
            userId = User.Identity?.Name
        });
    }
}