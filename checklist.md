# Budgeting PWA Development Checklist

## Backend Development (ASP.NET Core)

### Project Setup & Configuration
- [x] Initialize ASP.NET Core Web API project
- [x] Add NuGet packages (EF Core, Npgsql, JWT authentication)
- [x] Configure appsettings.json with runtime secret placeholders
- [x] Create C# model classes for all entities
- [x] Set up Entity Framework DbContext and relationships

### Authentication & Authorization
- [x] Implement JWT bearer authentication middleware (Zitadel)
- [x] Create custom Authorization Handler (SpaceMemberRequirement)
- [x] Register authorization policy in Program.cs
- [x] Secure all endpoints with custom authorization policy

### User & Space Management
- [x] Create POST /api/auth/register endpoint
- [x] Implement user creation with default space logic
- [x] Implement GET /api/spaces to list user spaces
- [x] Implement GET /api/spaces/{id} to get space details
- [x] Implement POST /api/spaces to create new spaces
- [x] Implement PUT /api/spaces/{id} to update space details
- [x] Implement DELETE /api/spaces/{id} to delete a space
- [x] Implement GET /api/spaces/{id}/members to list members
- [x] Implement POST /api/spaces/{id}/members to add a member
- [x] Implement PUT /api/spaces/{id}/members/{userId} to update a member's role
- [x] Implement DELETE /api/spaces/{id}/members/{userId} to remove a member
- [x] Implement GET /api/users/me for user profile management
- [x] Implement PUT /api/users/me to update user profile
- [x] Implement GET /api/users/me/spaces for detailed space information
- [x] Implement GET /api/users/search for user search functionality
- [x] Implement GET /api/users/me/activity for user activity dashboard
- [x] Implement DELETE /api/users/me for account deletion
- [x] Configure JSON serialization to handle entity reference cycles

### Core Feature Endpoints (CRUD)
- [ ] Create API controllers for:
  - [ ] Accounts
  - [ ] Expenses
  - [ ] Incomes
  - [ ] Budgets
  - [ ] SavingsGoals
  - [ ] Categories
- [ ] Implement RESTful endpoints (GET, POST, PUT, DELETE) for each

### Business Logic & Services
- [ ] Implement transaction logic for automatic account balance updates
- [ ] Create ProjectionsService for cash flow forecasting
- [ ] Create SavingsGoalService for goal progress tracking
- [ ] Implement endpoints to expose service results

### Testing
- [ ] Write xUnit tests for business logic services
- [ ] Write WebApplicationFactory integration tests
- [ ] Test authorization rules end-to-end

## Frontend Development (React PWA)

### Phase 1 (MVP - Personal Budgeting)

#### PWA Foundation
- [ ] Initialize React project with PWA support (Vite PWA)
- [ ] Configure manifest.json
- [ ] Set up service worker caching strategy

#### UI/UX & Layout
- [ ] Select and set up UI component library/CSS framework
- [ ] Create main app layout with responsive navigation
- [ ] Design bottom navigation (Wallet, Budgets, Insights)

#### Authentication
- [x] Install and configure OIDC client library (oidc-client-ts)
- [x] Create AuthService module
- [x] Build ProtectedRoute component
- [x] Create login and callback page UI
- [x] Implement AuthContext for state management

#### User & Space Management Frontend
- [x] Create UserProfile component for profile management
- [x] Build SpaceManagement component for space administration
- [x] Implement UserActivity dashboard component
- [x] Create user menu dropdown in header with access to management features
- [x] Implement user search functionality for adding space members
- [x] Add space member management (add/remove/role management)
- [x] Integrate user management components into existing header

#### State Management & Core Features
- [x] Implement SpaceContext for space state management
- [x] Create SpaceSelector component for switching between spaces
- [x] Build API service layer with comprehensive endpoints
- [ ] Build "Wallet" page for account management
- [ ] Build "Budgets" page for budget progress display
- [ ] Create reusable forms for expenses/incomes with account selector
- [ ] Connect financial components to state management and backend API

### Phase 2 (V2 - Collaboration)
- [x] Create "Manage Spaces" page
- [x] Implement space-switcher in navigation UI
- [x] Enable collaborative space features

## Infrastructure & Deployment

### AWS Infrastructure (CDK)
- [ ] Set up AWS Lambda for API hosting
- [ ] Configure Amazon API Gateway
- [ ] Set up Amazon RDS Serverless v2 (PostgreSQL)
- [ ] Define all resources as CDK code

### Database Management
- [ ] Set up Entity Framework Core Migrations
- [ ] Configure dotnet ef command-line tools
- [ ] Implement code-first migration workflow

### CI/CD Pipelines
- [ ] Configure GitHub Actions for backend deployment
- [ ] Set up Vercel integration for frontend deployment
- [ ] Configure automated testing in CI pipeline

### Secrets Management
- [ ] Set up AWS Systems Manager Parameter Store for runtime secrets
- [ ] Configure GitHub Actions encrypted secrets for CI/CD
- [ ] Set up Vercel environment variables for build-time config

### Mobile Deployment
- [ ] Configure PWABuilder for Android App Bundle generation
- [ ] Set up Google Play Console deployment process

## Testing Strategy
- [ ] Implement TDD approach for new features
- [ ] Set up Jest and React Testing Library for frontend
- [ ] Configure Cypress/Playwright for E2E testing
- [ ] Establish testing coverage targets

## Data Model Entities
- [x] User (UserId, Email, FirstName, LastName, AuthenticationProviderId)
- [x] Space (SpaceId, Name, OwnerId)
- [x] SpaceMember (UserId, SpaceId, Role)
- [x] Account (AccountId, SpaceId, Name, Type, StartingBalance, CurrentBalance)
- [x] Expense (ExpenseId, SpaceId, AccountId, Title, Amount, Date, AddedByUserId, CategoryId, Notes)
- [x] Income (IncomeId, SpaceId, AccountId, Title, Amount, Date, AddedByUserId)
- [x] Category (CategoryId, SpaceId, Name, Icon)
- [x] Budget (BudgetId, SpaceId, CategoryId, Amount, StartDate, EndDate)
- [x] SavingsGoal (GoalId, SpaceId, Name, TargetAmount, CurrentAmount, TargetDate)

## Core Features Implementation Status
- [x] Multi-tenant "Space" architecture
- [x] User profile management and authentication
- [x] Space creation, management, and collaboration
- [x] User search and space member management
- [x] Activity dashboard and user insights
- [ ] Wallet/Account management
- [ ] Expense & Income tracking
- [ ] Budget management with visual feedback
- [ ] Savings goals with progress tracking
- [ ] Financial projections and forecasting
- [ ] Data visualization & insights dashboard
- [x] Secure OAuth 2.0 authentication with PKCE
- [x] Collaborative spaces (V2) - Core functionality complete
- [ ] Read-only offline access via service worker
