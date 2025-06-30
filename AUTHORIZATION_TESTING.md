# Authorization Testing Guide

## Overview
The authorization system uses resource-based authorization to ensure users can only access data from spaces they are members of.

## Key Components

### 1. SpaceMemberAuthorizationHandler
- Located in `/Authorization/SpaceMemberAuthorizationHandler.cs`
- Implements resource-based authorization for space membership
- Checks if a user is a member of a specific space

### 2. SpaceMemberRequirement
- Located in `/Authorization/SpaceMemberRequirement.cs`
- Defines the requirement for space membership authorization

### 3. AuthTestController
- Located in `/Controllers/AuthTestController.cs`
- Provides endpoints to test the authorization flow

## Test Endpoints

### Public Endpoint (No Auth)
```
GET /api/authtest/public
```

### Protected Endpoint (Basic Auth)
```
GET /api/authtest/protected
Authorization: Bearer <token>
```

### Debug User Info
```
GET /api/authtest/debug
Authorization: Bearer <token>
```
Returns user information and their space memberships.

### Create Test Space
```
POST /api/authtest/create-test-space
Authorization: Bearer <token>
```
Creates a test space and adds the user as an owner.

### Space-Based Authorization
```
GET /api/authtest/space/{spaceId}
Authorization: Bearer <token>
```
Tests if the user has access to a specific space.

## Running the Test Script

1. First, ensure the API is running:
```bash
cd Forecast_API
dotnet run
```

2. Get an access token from Zitadel

3. Run the test script:
```bash
./test_auth_flow.sh <access_token>
```

## Important Notes

1. **Resource-Based Authorization**: Controllers should use `IAuthorizationService.AuthorizeAsync()` with the spaceId as a resource, not the `[Authorize(Policy = "IsSpaceMember")]` attribute directly.

2. **Example Implementation**:
```csharp
var authResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
if (!authResult.Succeeded)
{
    return Forbid();
}
```

3. **Database Structure**: 
   - SpaceMember uses composite keys (UserId + SpaceId)
   - SpaceRole enum has two values: Member and Owner