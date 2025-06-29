# Frontend Authentication Plan

## 1. Technology Stack
- **Framework**: React (with Vite or Create React App)
- **Authentication Protocol**: OAuth 2.0 with PKCE
- **Recommended Library**: `oidc-client-ts`

## 2. Core Tasks

### A. Install and Configure `oidc-client-ts`
1.  **Installation**
    ```bash
    npm install oidc-client-ts
    ```

2.  **Configuration (`authConfig.js` or similar)**
    Create a configuration file for the `UserManager`.

    ```javascript
    import { UserManagerSettings } from 'oidc-client-ts';

    export const userManagerSettings: UserManagerSettings = {
        authority: 'https://your-zitadel-instance.com',
        client_id: 'your-react-client-id',
        redirect_uri: 'http://localhost:3000/signin-callback',
        post_logout_redirect_uri: 'http://localhost:3000/',
        response_type: 'code',
        scope: 'openid profile email',
        automaticSilentRenew: true,
        loadUserInfo: true,
    };
    ```

### B. Create an `AuthService`
Create a singleton service or a React Context to manage authentication state and interactions with the `UserManager`.

**`AuthContext.js`**
-   **State**: `user`, `isAuthenticated`, `isLoading`.
-   **`UserManager` instance**: `const userManager = new UserManager(userManagerSettings);`
-   **Functions**:
    -   `login()`: Calls `userManager.signinRedirect()`.
    -   `logout()`: Calls `userManager.signoutRedirect()`.
    -   `handleCallback()`: Calls `userManager.signinCallback()` on the callback page to complete the login process.
    -   `getUser()`: Provides the current user object.
    -   `getAccessToken()`: Retrieves the access token to be used in API calls.

### C. Implement Login/Logout and Callback Components

1.  **Login Button**
    -   A simple button that calls the `login()` function from the `AuthContext`.

2.  **Logout Button**
    -   A button that calls the `logout()` function.

3.  **Callback Component (`/signin-callback`)**
    -   A dedicated route that renders a component which calls `handleCallback()` on mount.
    -   This component will handle the token exchange and redirect the user to the appropriate page after login.
    -   It should display a loading indicator while the process completes.

### D. Protect Routes
Create a higher-order component (HOC) or a wrapper component to protect routes that require authentication.

**`ProtectedRoute.js`**
```javascript
import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
```

### E. Integrate with API Client (e.g., Axios)
Configure an API client to automatically include the access token in the `Authorization` header.

**`apiClient.js`**
```javascript
import axios from 'axios';
import { userManager } from './AuthService'; // Assuming userManager is exported

const apiClient = axios.create({
    baseURL: 'https://your-api-url.com/api',
});

apiClient.interceptors.request.use(async (config) => {
    const user = await userManager.getUser();
    if (user && !user.expired) {
        config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    return config;
});

export default apiClient;
```

This setup provides a secure and robust way to handle user authentication in the React client, leveraging the recommended PKCE flow for SPAs.
