# Budgeting PWA Development Checklist

## Backend Development (ASP.NET Core)

### Project Setup & Configuration
- [x] Initialize ASP.NET Core Web API project
- [x] Add NuGet packages (EF Core, Npgsql, JWT authentication)
- [x] Configure appsettings.json with runtime secret placeholders
- [x] Create C# model classes for all entities
- [x] Set up Entity Framework DbContext and relationships

### Authentication & Authorization
- [ ] Implement JWT bearer authentication middleware (Zitadel)
- [ ] Create custom Authorization Handler (SpaceMemberRequirement)
- [ ] Register authorization policy in Program.cs
- [ ] Secure all endpoints with custom authorization policy

### User & Space Management
- [ ] Create POST /api/auth/register endpoint
- [ ] Implement user creation with default space logic

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
- [ ] Install and configure OIDC client library (oidc-client-ts)
- [ ] Create AuthService module
- [ ] Build ProtectedRoute component
- [ ] Create login and callback page UI

#### State Management & Core Features
- [ ] Select and configure state management (Zustand/Redux Toolkit)
- [ ] Build "Wallet" page for account management
- [ ] Build "Budgets" page for budget progress display
- [ ] Create reusable forms for expenses/incomes with account selector
- [ ] Connect components to state management and backend API

### Phase 2 (V2 - Collaboration)
- [ ] Create "Manage Spaces" page
- [ ] Implement space-switcher in navigation UI

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
- [ ] Multi-tenant "Space" architecture
- [ ] Wallet/Account management
- [ ] Expense & Income tracking
- [ ] Budget management with visual feedback
- [ ] Savings goals with progress tracking
- [ ] Financial projections and forecasting
- [ ] Data visualization & insights dashboard
- [ ] Secure OAuth 2.0 authentication with PKCE
- [ ] Collaborative spaces (V2)
- [ ] Read-only offline access via service worker