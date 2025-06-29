# Authentication and Authorization Plan

## 1. Overview

This document outlines the authentication and authorization strategy for the Forecast API. We will use a modern, secure, and flexible approach based on **OAuth 2.0** and **OpenID Connect (OIDC)**.

**Identity Provider (IdP):** Zitadel will be our external IdP. It will handle user registration, login, and management, providing us with JWTs for authenticated users.

**Authorization:** Within the application, we'll use a role-based access control (RBAC) system built on top of our "Space" concept.

## 2. Authentication Flow (PKCE)

We will implement the **Proof Key for Code Exchange (PKCE)** flow, which is ideal for single-page applications (SPAs) and mobile apps.

1.  **Initiate Login:** The React client initiates the login process, generating a `code_verifier` and a `code_challenge`.
2.  **Redirect to Zitadel:** The client redirects the user to the Zitadel authorization endpoint with the `code_challenge`.
3.  **User Authentication:** The user authenticates with Zitadel (e.g., username/password, social login).
4.  **Authorization Code:** Zitadel redirects the user back to the client with an `authorization_code`.
5.  **Token Exchange:** The client sends the `authorization_code` and the `code_verifier` to the Zitadel token endpoint.
6.  **JWT Tokens:** Zitadel verifies the `code_verifier` and returns an `id_token` and an `access_token`.
7.  **API Authentication:** The client stores the tokens securely and sends the `access_token` in the `Authorization` header for all API requests.

## 3. Backend (ASP.NET Core)

### Token Validation

-   The API will be configured to accept JWTs from Zitadel.
-   It will validate the token's signature, issuer, audience, and expiration.
-   The user's unique ID from the token (`sub` claim) will be used to identify the user in our database.

### User Provisioning

-   When a user first authenticates, we will use the information from the `id_token` (email, name, etc.) to create a corresponding `User` record in our database. This is known as Just-In-Time (JIT) provisioning.
-   The `AuthenticationProviderId` in our `User` model will store the `sub` from the JWT.

## 4. Authorization Model

-   **Spaces:** All data in the application is scoped to a "Space".
-   **Space Members:** Users are granted access to Spaces via the `SpaceMember` entity.
-   **Roles:** The `SpaceMember` entity will have a `Role` (e.g., `Admin`, `Member`) which will determine their permissions within that Space.
-   **API Endpoints:** All API endpoints that access Space-related data will be protected by a custom authorization policy that verifies the user is a member of the requested Space.

## 5. Key Components to Build

-   **`[Authorize]` attribute:** Standard ASP.NET Core attribute to protect endpoints.
-   **Custom Authorization Policy (`SpaceMemberRequirement`):** A policy to check if the authenticated user is a member of the space they are trying to access.
-   **`IAuthorizationHandler`:** The implementation of the `SpaceMemberRequirement` policy.
-   **User Service:** A service to handle JIT user provisioning.

## 6. Frontend (React)

-   **Authentication Library:** We will use a library like `oidc-client-ts` or a similar library to handle the complexities of the PKCE flow.
-   **Token Storage:** Securely store tokens in memory or a short-lived session. Avoid using `localStorage`.
-   **Authenticated Routes:** Protect frontend routes that require authentication.
-   **API Client:** An API client (e.g., using `axios`) that automatically attaches the `access_token` to all requests.

This plan provides a robust and secure foundation for managing users and access control in the Forecast application.
