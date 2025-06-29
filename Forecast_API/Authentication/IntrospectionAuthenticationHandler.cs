using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
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

    public IntrospectionAuthenticationHandler(
        IOptionsMonitor<IntrospectionAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ITokenIntrospectionService introspectionService)
        : base(options, logger, encoder)
    {
        _introspectionService = introspectionService;
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

            Logger.LogInformation("Attempting token introspection");

            // Introspect the token
            var principal = await _introspectionService.IntrospectTokenAsync(token);
            
            if (principal == null)
            {
                Logger.LogWarning("Token introspection failed or token is invalid");
                return AuthenticateResult.Fail("Invalid token");
            }

            Logger.LogInformation("Token introspection successful");

            // Trigger user creation/retrieval
            var userService = Context.RequestServices.GetRequiredService<IUserService>();
            try
            {
                await userService.GetOrCreateUserAsync(principal);
                Logger.LogInformation("User provisioning completed");
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