# Zitadel API Setup Instructions

## ✅ Backend Implementation Complete

The backend has been fully configured to work with Zitadel's OAuth 2.0 token introspection. You now need to:

## 1. Register API in Zitadel

Follow these steps exactly as you outlined:

1. **Go to your Zitadel project** and click "New"
2. **Register the API** with name like "Forecast Budget API"
3. **Select type: API**
4. **Authentication method: Basic**
5. **Click Continue → Review → Create**
6. **Copy the Client ID and Client Secret** from the results

## 2. Update Backend Configuration

After registering the API in Zitadel, update your `appsettings.Development.json`:

```json
{
  "Authentication": {
    "Zitadel": {
      "Authority": "http://localhost:8080",
      "ClientId": "326696004336287748",
      "ApiClientId": "YOUR_NEW_API_CLIENT_ID_HERE",
      "ApiClientSecret": "YOUR_NEW_API_CLIENT_SECRET_HERE", 
      "IntrospectionEndpoint": "http://localhost:8080/oauth/v2/introspect"
    }
  }
}
```

**Replace:**
- `YOUR_NEW_API_CLIENT_ID_HERE` with the API Client ID from step 1
- `YOUR_NEW_API_CLIENT_SECRET_HERE` with the API Client Secret from step 1

## 3. Implementation Details

### What the Backend Does Now:

1. **Receives Bearer token** from frontend
2. **Calls Zitadel introspection endpoint:**
   ```
   POST http://localhost:8080/oauth/v2/introspect
   Authorization: Basic base64(api_client_id:api_client_secret)
   Content-Type: application/x-www-form-urlencoded
   
   token=ACCESS_TOKEN&token_type_hint=access_token&scope=openid
   ```
3. **Processes Zitadel response** and maps claims
4. **Creates/retrieves user** automatically in database
5. **Authorizes API requests** based on space membership

### Expected Zitadel Response Format:
```json
{
  "active": true,
  "aud": ["326696004336287748"],
  "client_id": "326696004336287748", 
  "exp": 1751274380,
  "iat": 1751231180,
  "iss": "http://localhost:8080",
  "sub": "326695658357063684",
  "username": "user@domain.com",
  "email": "user@domain.com",
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe"
}
```

## 4. Testing Steps

1. **Start Zitadel** on port 8080
2. **Update configuration** with your API credentials  
3. **Restart backend** (it will log the new configuration)
4. **Test authentication flow** end-to-end

## 5. Frontend Compatibility

✅ **No frontend changes needed!** The frontend will continue to:
- Use the same OAuth client ID (`326696004336287748`)
- Send Bearer tokens in Authorization headers
- Work exactly as before

## 6. Benefits of This Approach

- ✅ **Real-time token validation** - tokens are validated on every request
- ✅ **Supports token revocation** - revoked tokens immediately stop working
- ✅ **No JWT signature issues** - introspection is more reliable
- ✅ **Better error handling** - clear responses from Zitadel
- ✅ **Automatic user provisioning** - users created on first login

## 7. Security Notes

- API Client Secret is used for **server-to-server** communication only
- Frontend users never see the API credentials
- All requests are validated in real-time with Zitadel
- Database transactions ensure data consistency

---

**Next Step:** Register the API in Zitadel and update the configuration!