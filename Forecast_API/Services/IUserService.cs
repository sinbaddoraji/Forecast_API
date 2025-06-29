using System.Security.Claims;
using Forecast_API.Models;

namespace Forecast_API.Services;

public interface IUserService
{
    Task<User> GetOrCreateUserAsync(ClaimsPrincipal principal);
}