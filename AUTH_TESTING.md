# Authentication Testing Guide

## Prerequisites
1. Ensure the API is running (`dotnet run`)
2. Obtain a valid JWT token from your Zitadel OAuth provider
3. Have `curl` and `jq` installed for testing

## Quick Test
```bash
# Set your JWT token
export TOKEN="your-jwt-token-here"

# Run the test script
./test_auth_flow.sh
```

## Manual Testing

### 1. Test Public Endpoint (No Auth Required)
```bash
curl http://localhost:5000/api/authtest/public
```

### 2. Test Protected Endpoint (Auth Required)
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/authtest/protected
```

### 3. Get User Debug Information
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/authtest/debug | jq .
```

### 4. Create a Test Space
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/authtest/create-test-space | jq .
```

### 5. Test Space-Based Authorization
```bash
# Replace SPACE_ID with the ID from step 4
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/authtest/space/SPACE_ID | jq .
```

## Troubleshooting

### Authorization Error
If you see the error "User X is not a member of space Y":
1. Run the debug endpoint to see which spaces you're a member of
2. Create a new test space using the create-test-space endpoint
3. Use the newly created space ID in your requests

### Token Issues
- Ensure your token is not expired
- Verify the token contains the required claims (sub, email, etc.)
- Check that Zitadel configuration in appsettings.json is correct

### Common Issues
1. **Same GUID for user and space**: This happens when passing the wrong parameter
2. **No spaces found**: New users need to create a space first
3. **403 Forbidden**: User is authenticated but not authorized for the specific space