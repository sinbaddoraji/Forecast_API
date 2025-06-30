# Backend API Development (ASP.NET Core)

## Objective
Build a single, performant, and centralized API to be consumed by the PWA.

## Environment Variables
The backend is configured through `appsettings.Development.json`. The following variables are essential for running the application:

- **`ConnectionStrings:DefaultConnection`**: The connection string for the PostgreSQL database.
- **`Authentication:Zitadel:Authority`**: The URL of the Zitadel instance.
- **`Authentication:Zitadel:ClientId`**: The client ID for the **frontend** application, used to validate the audience of the JWT.
- **`Authentication:Zitadel:ApiClientId`**: The client ID for the **backend** API, used for token introspection.
- **`Authentication:Zitadel:ApiClientSecret`**: The client secret for the **backend** API, used for token introspection.
- **`Authentication:Zitadel:IntrospectionEndpoint`**: The URL of the Zitadel introspection endpoint.

## Tasks

### Project Setup & Configuration
- **[DONE]** Initialize a new ASP.NET Core Web API project.
- **[DONE]** Add essential NuGet packages (EF Core, Npgsql for PostgreSQL, JWT bearer authentication).
- **[DONE]** Configure appsettings.json with placeholders for secrets that will be injected at runtime.
- **[DONE]** Create C# model classes for all entities (User, Space, Account, etc.).
- **[IN PROGRESS]** Set up the Entity Framework DbContext and configure entity relationships.

### Authentication & Authorization
- Implement JWT bearer authentication middleware to validate tokens from Zitadel.
- Create a custom Authorization Handler (e.g., SpaceMemberRequirement).
- Register the authorization policy in Program.cs.
- Secure all data-accessing controllers/endpoints with the custom authorization policy.

### User & Space Management
- Create an endpoint (e.g., POST /api/auth/register).
- Implement the logic to create a User, a default Space, and a SpaceMember record.

### Core Feature Endpoints (CRUD)
- Create API controllers for Accounts, Expenses, Incomes, Budgets, SavingsGoals, and Categories.
- For each controller, implement the standard RESTful endpoints (GET, POST, PUT, DELETE).

### Business Logic & Services
- Implement transaction logic to automatically update Account balances when Expenses or Incomes are created, updated, or deleted.
- Create a ProjectionsService to encapsulate the logic for forecasting cash flow.
- Create a SavingsGoalService to handle logic for updating goal progress.
- Implement endpoints to expose the results of these services.

### Testing
- Write xUnit tests for the business logic in the services, especially the account balance transaction logic.
- Write WebApplicationFactory integration tests to verify the end-to-end request pipeline, especially authorization rules.
