using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Forecast_API.Services;

namespace Forecast_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IUserService userService, ILogger<AuthController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpPost("register")]
    [Authorize]
    public async Task<IActionResult> Register()
    {
        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);
            return Ok(new { 
                userId = user.UserId, 
                email = user.Email, 
                firstName = user.FirstName, 
                lastName = user.LastName 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration");
            return StatusCode(500, new { error = "Registration failed" });
        }
    }
}