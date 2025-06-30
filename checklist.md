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

#### Accounts Management
- [ ] Create Acc ountsController
- [ ] Implement GET /api/spaces/{spaceId}/accounts - List all accounts in a space
- [ ] Implement GET /api/spaces/{spaceId}/accounts/{accountId} - Get specific account details
- [ ] Implement POST /api/spaces/{spaceId}/accounts - Create new account
- [ ] Implement PUT /api/spaces/{spaceId}/accounts/{accountId} - Update account details
- [ ] Implement DELETE /api/spaces/{spaceId}/accounts/{accountId} - Delete account
- [ ] Implement GET /api/spaces/{spaceId}/accounts/{accountId}/balance - Get current balance
- [ ] Implement GET /api/spaces/{spaceId}/accounts/{accountId}/transactions - Get account transaction history

#### Expenses Management
- [ ] Create ExpensesController
- [ ] Implement GET /api/spaces/{spaceId}/expenses - List expenses with filtering/pagination
- [ ] Implement GET /api/spaces/{spaceId}/expenses/{expenseId} - Get specific expense
- [ ] Implement POST /api/spaces/{spaceId}/expenses - Create new expense
- [ ] Implement PUT /api/spaces/{spaceId}/expenses/{expenseId} - Update expense
- [ ] Implement DELETE /api/spaces/{spaceId}/expenses/{expenseId} - Delete expense
- [ ] Implement GET /api/spaces/{spaceId}/expenses/summary - Get expense summaries by category/period
- [ ] Implement GET /api/spaces/{spaceId}/expenses/recent - Get recent expenses

#### Income Management
- [ ] Create IncomesController
- [ ] Implement GET /api/spaces/{spaceId}/incomes - List incomes with filtering/pagination
- [ ] Implement GET /api/spaces/{spaceId}/incomes/{incomeId} - Get specific income
- [ ] Implement POST /api/spaces/{spaceId}/incomes - Create new income
- [ ] Implement PUT /api/spaces/{spaceId}/incomes/{incomeId} - Update income
- [ ] Implement DELETE /api/spaces/{spaceId}/incomes/{incomeId} - Delete income
- [ ] Implement GET /api/spaces/{spaceId}/incomes/summary - Get income summaries by period
- [ ] Implement GET /api/spaces/{spaceId}/incomes/recent - Get recent incomes

#### Categories Management
- [ ] Create CategoriesController
- [ ] Implement GET /api/spaces/{spaceId}/categories - List all categories in a space
- [ ] Implement GET /api/spaces/{spaceId}/categories/{categoryId} - Get specific category
- [ ] Implement POST /api/spaces/{spaceId}/categories - Create new category
- [ ] Implement PUT /api/spaces/{spaceId}/categories/{categoryId} - Update category
- [ ] Implement DELETE /api/spaces/{spaceId}/categories/{categoryId} - Delete category
- [ ] Implement GET /api/spaces/{spaceId}/categories/{categoryId}/expenses - Get expenses by category
- [ ] Implement GET /api/spaces/{spaceId}/categories/spending-summary - Get spending by category

#### Budgets Management
- [ ] Create BudgetsController
- [ ] Implement GET /api/spaces/{spaceId}/budgets - List budgets with current period status
- [ ] Implement GET /api/spaces/{spaceId}/budgets/{budgetId} - Get specific budget with progress
- [ ] Implement POST /api/spaces/{spaceId}/budgets - Create new budget
- [ ] Implement PUT /api/spaces/{spaceId}/budgets/{budgetId} - Update budget
- [ ] Implement DELETE /api/spaces/{spaceId}/budgets/{budgetId} - Delete budget
- [ ] Implement GET /api/spaces/{spaceId}/budgets/current - Get current period budgets with spending
- [ ] Implement GET /api/spaces/{spaceId}/budgets/{budgetId}/progress - Get detailed budget progress
- [ ] Implement GET /api/spaces/{spaceId}/budgets/alerts - Get budget alerts/warnings

#### Savings Goals Management
- [ ] Create SavingsGoalsController
- [ ] Implement GET /api/spaces/{spaceId}/savingsgoals - List all savings goals
- [ ] Implement GET /api/spaces/{spaceId}/savingsgoals/{goalId} - Get specific goal with progress
- [ ] Implement POST /api/spaces/{spaceId}/savingsgoals - Create new savings goal
- [ ] Implement PUT /api/spaces/{spaceId}/savingsgoals/{goalId} - Update savings goal
- [ ] Implement DELETE /api/spaces/{spaceId}/savingsgoals/{goalId} - Delete savings goal
- [ ] Implement POST /api/spaces/{spaceId}/savingsgoals/{goalId}/contribute - Add contribution to goal
- [ ] Implement POST /api/spaces/{spaceId}/savingsgoals/{goalId}/withdraw - Withdraw from goal
- [ ] Implement GET /api/spaces/{spaceId}/savingsgoals/{goalId}/history - Get contribution history
- [ ] Implement GET /api/spaces/{spaceId}/savingsgoals/summary - Get goals progress summary

#### Financial Analytics & Reports
- [ ] Create AnalyticsController
- [ ] Implement GET /api/spaces/{spaceId}/analytics/spending-trends - Get spending trends over time
- [ ] Implement GET /api/spaces/{spaceId}/analytics/income-trends - Get income trends over time
- [ ] Implement GET /api/spaces/{spaceId}/analytics/cash-flow - Get cash flow analysis
- [ ] Implement GET /api/spaces/{spaceId}/analytics/category-breakdown - Get spending by category
- [ ] Implement GET /api/spaces/{spaceId}/analytics/monthly-summary - Get monthly financial summary
- [ ] Implement GET /api/spaces/{spaceId}/analytics/budget-performance - Get budget vs actual performance
- [ ] Implement GET /api/spaces/{spaceId}/analytics/net-worth - Calculate net worth over time
- [ ] Implement GET /api/spaces/{spaceId}/analytics/projections - Get financial projections

#### Data Import/Export
- [ ] Create ImportExportController
- [ ] Implement POST /api/spaces/{spaceId}/import/csv - Import transactions from CSV
- [ ] Implement POST /api/spaces/{spaceId}/import/bank - Import from bank API/file formats
- [ ] Implement GET /api/spaces/{spaceId}/export/csv - Export transactions to CSV
- [ ] Implement GET /api/spaces/{spaceId}/export/pdf-report - Generate PDF financial report
- [ ] Implement GET /api/spaces/{spaceId}/export/excel - Export data to Excel format

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
- [x] Build API service layer with comprehensive endpoints for user/space management
- [ ] Extend API service layer for financial endpoints (accounts, expenses, incomes, budgets, goals)

#### Financial Management Pages
- [ ] Build "Wallet/Accounts" page for account management
  - [ ] List all accounts with balances
  - [ ] Create/edit/delete accounts
  - [ ] Account details view with transaction history
  - [ ] Account balance tracking and updates
- [ ] Build "Expenses" page for expense tracking
  - [ ] Add new expense form with category and account selection
  - [ ] List expenses with filtering and search
  - [ ] Edit/delete existing expenses
  - [ ] Expense summary views by category and time period
- [ ] Build "Income" page for income tracking
  - [ ] Add new income form with account selection
  - [ ] List incomes with filtering and search
  - [ ] Edit/delete existing incomes
  - [ ] Income summary and trends
- [ ] Build "Budgets" page for budget management
  - [ ] Create/edit budget forms with category selection
  - [ ] Budget progress displays with visual indicators
  - [ ] Budget vs actual spending comparison
  - [ ] Budget alerts and notifications
- [ ] Build "Savings Goals" page for goal tracking
  - [ ] Create/edit savings goals
  - [ ] Goal progress visualization
  - [ ] Contribution and withdrawal forms
  - [ ] Goal achievement tracking

#### Categories Management
- [ ] Create Categories management component
- [ ] Category selection components for expenses/budgets
- [ ] Category spending analysis views
- [ ] Custom category creation and editing

#### Analytics & Reports Frontend
- [ ] Build "Insights/Analytics" dashboard page
  - [ ] Spending trends charts and graphs
  - [ ] Income vs expenses comparison
  - [ ] Category breakdown pie/bar charts
  - [ ] Monthly/yearly financial summaries
  - [ ] Net worth tracking over time
  - [ ] Cash flow projections
- [ ] Create interactive data visualization components
- [ ] Implement export functionality (CSV, PDF reports)
- [ ] Build responsive charts for mobile devices

#### Forms & UI Components
- [ ] Create reusable form components for financial data entry
- [ ] Build amount input component with currency formatting
- [ ] Create date picker components for transactions
- [ ] Implement account selector dropdown component
- [ ] Build category selector with icons
- [ ] Create confirmation dialogs for delete operations
- [ ] Implement loading states and error handling for all forms

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
