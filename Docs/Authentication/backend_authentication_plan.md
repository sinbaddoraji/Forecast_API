# Backend Authentication & Authorization Plan

## 1. Technology Stack
- **Framework**: ASP.NET Core 8
- **Identity Provider**: Zitadel (via OpenID Connect)
- **Token Format**: JWT

## 2. Core Tasks

### A. Configure JWT Authentication
In `Program.cs`, configure the authentication services.

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://your-zitadel-instance.com";
        options.Audience = "your-zitadel-api-audience";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            NameClaimType = "sub" // Use subject claim for User.Identity.Name
        };
    });
```

### B. Just-In-Time (JIT) User Provisioning
Create a service to handle user creation in the local database upon their first login.

1.  **`IUserService` Interface & `UserService` Implementation**
    -   Method: `Task<User> GetOrCreateUserAsync(ClaimsPrincipal principal)`
    -   This method will be called after a token is successfully validated.
    -   It will check if a user with the given `AuthenticationProviderId` (the `sub` claim from the JWT) already exists.
    -   If not, it will create a new `User` entity using claims from the token (e.g., email, name) and save it to the database.

2.  **Integration with Authentication Events**
    -   We can use the `OnTokenValidated` event in the JWT Bearer options to call the `UserService`.

### C. Custom Authorization for Multi-Tenancy
Implement a policy-based authorization system to ensure users can only access data within the "Spaces" they are members of.

1.  **Create `SpaceMemberRequirement`**
    -   A class implementing `IAuthorizationRequirement`.
    -   It will not contain data; it will act as a marker for the policy.

2.  **Create `SpaceMemberAuthorizationHandler`**
    -   Inherits from `AuthorizationHandler<SpaceMemberRequirement, Guid>` (or the type of the resource ID, e.g., `HttpContext`).
    -   This handler will contain the core logic:
        a. Get the current user's ID from `context.User`.
        b. Get the `spaceId` from the route parameters (e.g., `/api/spaces/{spaceId}/...`).
        c. Query the database to check if a `SpaceMember` record exists linking the user ID and the space ID.
        d. If the user is a member, call `context.Succeed(requirement)`.

3.  **Register the Policy**
    In `Program.cs`, register the policy:

    ```csharp
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("IsSpaceMember", policy =>
            policy.Requirements.Add(new SpaceMemberRequirement()));
    });
    builder.Services.AddSingleton<IAuthorizationHandler, SpaceMemberAuthorizationHandler>();
    ```

### D. Protect Endpoints
Apply the attributes to controllers or specific action methods.

```csharp
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
[Authorize(Policy = "IsSpaceMember")]
public class ExpensesController : ControllerBase
{
    // ... actions ...
}
```

## 4. User Model
Ensure the `User` model in `Models/Auth/User.cs` has the necessary fields:

-   `Id` (Primary Key)
-   `AuthenticationProviderId` (string, indexed) - This will store the `sub` claim from Zitadel.
-   `Email` (string, indexed)
-   `FirstName`, `LastName`, etc.
