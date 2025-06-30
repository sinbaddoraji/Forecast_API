using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Caching.Memory;
using Forecast_API.Services;

namespace Forecast_API.Authentication;

public class IntrospectionAuthenticationSchemeOptions : AuthenticationSchemeOptions
{
    public string Authority { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}

public class IntrospectionAuthenticationHandler : AuthenticationHandler<IntrospectionAuthenticationSchemeOptions>
{
    private readonly ITokenIntrospectionService _introspectionService;
    private readonly IMemoryCache _cache;

    public IntrospectionAuthenticationHandler(
        IOptionsMonitor<IntrospectionAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ITokenIntrospectionService introspectionService,
        IMemoryCache cache)
        : base(options, logger, encoder)
    {
        _introspectionService = introspectionService;
        _cache = cache;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        try
        {
            // Extract token from Authorization header
            if (!Request.Headers.ContainsKey("Authorization"))
            {
                return AuthenticateResult.NoResult();
            }

            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return AuthenticateResult.NoResult();
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrEmpty(token))
            {
                return AuthenticateResult.NoResult();
            }

            // Check cache first to avoid repeated database queries
            var cacheKey = $"user_principal_{token.GetHashCode()}";
            if (_cache.TryGetValue(cacheKey, out ClaimsPrincipal? cachedPrincipal))
            {
                Logger.LogDebug("Using cached principal for token");
                var cachedTicket = new AuthenticationTicket(cachedPrincipal!, Scheme.Name);
                return AuthenticateResult.Success(cachedTicket);
            }

            Logger.LogInformation("Attempting token introspection");

            // Introspect the token
            var principal = await _introspectionService.IntrospectTokenAsync(token);
            
            if (principal == null)
            {
                Logger.LogWarning("Token introspection failed or token is invalid");
                return AuthenticateResult.Fail("Invalid token");
            }

            Logger.LogInformation("Token introspection successful");

            // Trigger user creation/retrieval only once per token
            var userService = Context.RequestServices.GetRequiredService<IUserService>();
            try
            {
                await userService.GetOrCreateUserAsync(principal);
                Logger.LogInformation("User provisioning completed");
                
                // Cache the principal for 5 minutes to avoid repeated DB calls
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                    SlidingExpiration = TimeSpan.FromMinutes(2),
                    Priority = CacheItemPriority.Normal
                };
                _cache.Set(cacheKey, principal, cacheOptions);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error during user provisioning");
                // Don't fail authentication due to user provisioning issues
            }

            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error during authentication");
            return AuthenticateResult.Fail($"Authentication error: {ex.Message}");
        }
    }
}