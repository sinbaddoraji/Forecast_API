# Claude Development Context

## Project Overview
This is a **Budgeting Progressive Web App (PWA)** built with:
- **Backend**: ASP.NET Core Web API
- **Frontend**: React PWA
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: OAuth 2.0 with PKCE via Zitadel
- **Hosting**: AWS Lambda + API Gateway (backend), Vercel (frontend)
- **Architecture**: Multi-tenant "Space" based system

## Environment Variables
The backend is configured through `appsettings.Development.json`. The following variables are essential for running the application:

- **`ConnectionStrings:DefaultConnection`**: The connection string for the PostgreSQL database.
- **`Authentication:Zitadel:Authority`**: The URL of the Zitadel instance.
- **`Authentication:Zitadel:ClientId`**: The client ID for the **frontend** application, used to validate the audience of the JWT.
- **`Authentication:Zitadel:ApiClientId`**: The client ID for the **backend** API, used for token introspection.
- **`Authentication:Zitadel:ApiClientSecret`**: The client secret for the **backend** API, used for token introspection.
- **`Authentication:Zitadel:IntrospectionEndpoint`**: The URL of the Zitadel introspection endpoint.

## Key Commands
```bash
# Backend Development
dotnet run                          # Run the API locally
dotnet ef migrations add <name>     # Create new migration
dotnet ef database update          # Apply migrations
dotnet test                        # Run backend tests

# Frontend Development  
npm run dev                        # Run React PWA in development
npm run build                      # Build for production
npm run test                       # Run frontend tests
npm run lint                       # Lint frontend code

# Infrastructure
cdk deploy                         # Deploy AWS infrastructure
cdk diff                          # Show infrastructure changes
```

## Project Structure
```
/
├── Forecast_API/                  # ASP.NET Core Web API
│   ├── Controllers/               # API endpoints
│   ├── Models/                    # Entity models
│   ├── Services/                  # Business logic
│   ├── Data/                      # DbContext and configurations
│   └── Program.cs                 # App configuration
├── client/                        # React PWA (to be created)
├── infrastructure/                # AWS CDK code (to be created)
└── checklist.md                   # Development roadmap
```

## Core Entities & Relationships
- **User**: Individual users with OAuth authentication
- **Space**: Container for financial data (personal or shared)
- **SpaceMember**: Links users to spaces with roles
- **Account**: Real-world funding sources (bank accounts, wallets)
- **Expense/Income**: Financial transactions linked to accounts
- **Category**: Expense categorization system
- **Budget**: Monthly spending limits per category
- **SavingsGoal**: Target savings with progress tracking

## Security Model
- **Multi-tenant**: All data belongs to a Space
- **Authorization**: Users can only access data from spaces they're members of
- **Authentication**: JWT tokens from Zitadel OAuth provider
- **Custom Policy**: SpaceMemberRequirement for all data endpoints

## Design Decisions
- **Enums**: Use C# enums for fixed value sets (AccountType, SpaceRole) instead of string constants
- **EF Configuration**: Enums automatically converted to strings in database for readability
- **Entity Relationships**: Configured with proper cascade behaviors and foreign key constraints
- **Indexing**: Added indexes on frequently queried fields (Email, AuthenticationProviderId, Date fields)

## Development Priorities
1. **High Priority**: Backend setup, database models, authentication
2. **Medium Priority**: API endpoints, business logic, core UI
3. **Low Priority**: AWS infrastructure, CI/CD pipelines

## Testing Strategy
- **Backend**: xUnit for unit tests, WebApplicationFactory for integration
- **Frontend**: Jest + React Testing Library, Cypress for E2E
- **Approach**: Test-Driven Development (TDD) where applicable

## Current Status
- Initial ASP.NET Core project created
- WeatherForecast template controllers present
- Ready to implement the budgeting app architecture

## Next Steps
1. Create entity models and DbContext
2. Implement authentication and authorization
3. Build core API endpoints
4. Set up React PWA with authentication
5. Connect frontend to backend API
