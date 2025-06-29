using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace Forecast_API.Services;

public interface ITokenIntrospectionService
{
    Task<ClaimsPrincipal?> IntrospectTokenAsync(string token);
}

public class TokenIntrospectionService : ITokenIntrospectionService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TokenIntrospectionService> _logger;

    public TokenIntrospectionService(HttpClient httpClient, IConfiguration configuration, ILogger<TokenIntrospectionService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ClaimsPrincipal?> IntrospectTokenAsync(string token)
    {
        try
        {
            var authConfig = _configuration.GetSection("Authentication:Zitadel");
            var introspectionEndpoint = authConfig["IntrospectionEndpoint"];
            var apiClientId = authConfig["ApiClientId"];
            var apiClientSecret = authConfig["ApiClientSecret"];

            if (string.IsNullOrEmpty(introspectionEndpoint) || string.IsNullOrEmpty(apiClientId) || string.IsNullOrEmpty(apiClientSecret))
            {
                _logger.LogError("Missing Zitadel API configuration. Please ensure ApiClientId, ApiClientSecret, and IntrospectionEndpoint are configured.");
                return null;
            }
            
            _logger.LogInformation("Calling introspection endpoint: {Endpoint}", introspectionEndpoint);

            // Prepare the introspection request according to Zitadel documentation
            var requestContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("token", token),
                new KeyValuePair<string, string>("token_type_hint", "access_token"),
                new KeyValuePair<string, string>("scope", "openid")
            });

            // Set up Basic Authentication header as required by Zitadel
            var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiClientId}:{apiClientSecret}"));
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authValue);

            var response = await _httpClient.PostAsync(introspectionEndpoint, requestContent);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Introspection failed with status: {StatusCode}", response.StatusCode);
                return null;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Introspection response: {Response}", responseContent);

            var introspectionResult = JsonSerializer.Deserialize<JsonElement>(responseContent);

            if (!introspectionResult.TryGetProperty("active", out var activeProperty) || !activeProperty.GetBoolean())
            {
                _logger.LogWarning("Token is not active");
                return null;
            }

            // Build claims from introspection response
            var claims = new List<Claim>();

            // Map Zitadel introspection response to standard claims
            if (introspectionResult.TryGetProperty("sub", out var sub))
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, sub.GetString() ?? ""));
            }

            if (introspectionResult.TryGetProperty("email", out var email))
            {
                claims.Add(new Claim(ClaimTypes.Email, email.GetString() ?? ""));
            }

            if (introspectionResult.TryGetProperty("name", out var name))
            {
                claims.Add(new Claim(ClaimTypes.Name, name.GetString() ?? ""));
            }

            if (introspectionResult.TryGetProperty("given_name", out var givenName))
            {
                claims.Add(new Claim(ClaimTypes.GivenName, givenName.GetString() ?? ""));
            }

            if (introspectionResult.TryGetProperty("family_name", out var familyName))
            {
                claims.Add(new Claim(ClaimTypes.Surname, familyName.GetString() ?? ""));
            }

            if (introspectionResult.TryGetProperty("username", out var username))
            {
                claims.Add(new Claim("username", username.GetString() ?? ""));
            }

            if (introspectionResult.TryGetProperty("preferred_username", out var preferredUsername))
            {
                claims.Add(new Claim("preferred_username", preferredUsername.GetString() ?? ""));
            }

            // Add all other properties as claims for debugging and completeness
            foreach (var property in introspectionResult.EnumerateObject())
            {
                if (property.Name != "active") // Skip the 'active' property
                {
                    var value = property.Value.ValueKind == JsonValueKind.String 
                        ? property.Value.GetString() 
                        : property.Value.ToString();
                    
                    if (!string.IsNullOrEmpty(value))
                    {
                        claims.Add(new Claim(property.Name, value));
                    }
                }
            }

            var identity = new ClaimsIdentity(claims, "Introspection");
            return new ClaimsPrincipal(identity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token introspection");
            return null;
        }
    }
}