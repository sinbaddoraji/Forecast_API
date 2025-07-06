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
- [x] Create AccountsController
- [x] Implement GET /api/spaces/{spaceId}/accounts - List all accounts in a space
- [x] Implement GET /api/spaces/{spaceId}/accounts/{accountId} - Get specific account details
- [x] Implement POST /api/spaces/{spaceId}/accounts - Create new account
- [x] Implement PUT /api/spaces/{spaceId}/accounts/{accountId} - Update account details
- [x] Implement DELETE /api/spaces/{spaceId}/accounts/{accountId} - Delete account
- [x] Implement GET /api/spaces/{spaceId}/accounts/{accountId}/balance - Get current balance
- [x] Implement GET /api/spaces/{spaceId}/accounts/{accountId}/transactions - Get account transaction history

#### Expenses Management
- [x] Create ExpensesController
- [x] Implement GET /api/spaces/{spaceId}/expenses - List expenses with filtering/pagination
- [x] Implement GET /api/spaces/{spaceId}/expenses/{expenseId} - Get specific expense
- [x] Implement POST /api/spaces/{spaceId}/expenses - Create new expense
- [x] Implement PUT /api/spaces/{spaceId}/expenses/{expenseId} - Update expense
- [x] Implement DELETE /api/spaces/{spaceId}/expenses/{expenseId} - Delete expense
- [x] Implement GET /api/spaces/{spaceId}/expenses/summary - Get expense summaries by category/period
- [x] Implement GET /api/spaces/{spaceId}/expenses/recent - Get recent expenses
- [x] Implement GET /api/spaces/{spaceId}/expenses/total - Get total expenses for period
- [x] Implement GET /api/spaces/{spaceId}/expenses/by-category - Get expenses grouped by category

#### Income Management
- [x] Create IncomesController
- [x] Implement GET /api/spaces/{spaceId}/incomes - List incomes with filtering/pagination
- [x] Implement GET /api/spaces/{spaceId}/incomes/{incomeId} - Get specific income
- [x] Implement POST /api/spaces/{spaceId}/incomes - Create new income
- [x] Implement PUT /api/spaces/{spaceId}/incomes/{incomeId} - Update income
- [x] Implement DELETE /api/spaces/{spaceId}/incomes/{incomeId} - Delete income
- [x] Implement GET /api/spaces/{spaceId}/incomes/summary - Get income summaries by period
- [x] Implement GET /api/spaces/{spaceId}/incomes/recent - Get recent incomes
- [x] Create IncomeDto with proper DTOs following ExpenseDto pattern
- [x] Update IncomesController to use DTOs and fix validation issues

#### Categories Management
- [x] Create CategoriesController
- [x] Implement GET /api/spaces/{spaceId}/categories - List all categories in a space
- [x] Implement GET /api/spaces/{spaceId}/categories/{categoryId} - Get specific category
- [x] Implement POST /api/spaces/{spaceId}/categories - Create new category
- [x] Implement PUT /api/spaces/{spaceId}/categories/{categoryId} - Update category
- [x] Implement DELETE /api/spaces/{spaceId}/categories/{categoryId} - Delete category
- [x] Implement GET /api/spaces/{spaceId}/categories/{categoryId}/expenses - Get expenses by category
- [x] Implement GET /api/spaces/{spaceId}/categories/spending-summary - Get spending by category
- [x] Implement GET /api/spaces/{spaceId}/categories/{categoryId}/usage - Get category usage statistics
- [x] Implement GET /api/spaces/{spaceId}/categories/{categoryId}/total - Get total spent in category
- [x] Add Color property to Category entity for visual distinction

#### Budgets Management
- [x] Create BudgetsController
- [x] Implement GET /api/spaces/{spaceId}/budgets - List budgets with current period status
- [x] Implement GET /api/spaces/{spaceId}/budgets/{budgetId} - Get specific budget with progress
- [x] Implement POST /api/spaces/{spaceId}/budgets - Create new budget
- [x] Implement PUT /api/spaces/{spaceId}/budgets/{budgetId} - Update budget
- [x] Implement DELETE /api/spaces/{spaceId}/budgets/{budgetId} - Delete budget
- [x] Implement GET /api/spaces/{spaceId}/budgets/current - Get current period budgets with spending
- [x] Implement GET /api/spaces/{spaceId}/budgets/{budgetId}/progress - Get detailed budget progress
- [x] Implement GET /api/spaces/{spaceId}/budgets/alerts - Get budget alerts/warnings

#### Savings Goals Management
- [x] Create SavingsGoalsController
- [x] Implement GET /api/spaces/{spaceId}/savingsgoals - List all savings goals
- [x] Implement GET /api/spaces/{spaceId}/savingsgoals/{goalId} - Get specific goal with progress
- [x] Implement POST /api/spaces/{spaceId}/savingsgoals - Create new savings goal
- [x] Implement PUT /api/spaces/{spaceId}/savingsgoals/{goalId} - Update savings goal
- [x] Implement DELETE /api/spaces/{spaceId}/savingsgoals/{goalId} - Delete savings goal
- [x] Implement POST /api/spaces/{spaceId}/savingsgoals/{goalId}/contribute - Add contribution to goal
- [x] Implement POST /api/spaces/{spaceId}/savingsgoals/{goalId}/withdraw - Withdraw from goal
- [x] Implement GET /api/spaces/{spaceId}/savingsgoals/{goalId}/history - Get contribution history
- [x] Implement GET /api/spaces/{spaceId}/savingsgoals/summary - Get goals progress summary

#### Financial Analytics & Reports
- [x] Create AnalyticsController
- [x] Implement GET /api/spaces/{spaceId}/analytics/spending-trends - Get spending trends over time
- [x] Implement GET /api/spaces/{spaceId}/analytics/income-trends - Get income trends over time
- [x] Implement GET /api/spaces/{spaceId}/analytics/cash-flow - Get cash flow analysis
- [x] Implement GET /api/spaces/{spaceId}/analytics/category-breakdown - Get spending by category
- [x] Implement GET /api/spaces/{spaceId}/analytics/monthly-summary - Get monthly financial summary
- [x] Implement GET /api/spaces/{spaceId}/analytics/budget-performance - Get budget vs actual performance
- [x] Implement GET /api/spaces/{spaceId}/analytics/net-worth - Calculate net worth over time
- [x] Implement GET /api/spaces/{spaceId}/analytics/projections - Get financial projections

#### Data Import/Export
- [x] Create ImportExportController
- [x] Implement POST /api/spaces/{spaceId}/import/csv - Import transactions from CSV
- [ ] Implement POST /api/spaces/{spaceId}/import/bank - Import from bank API/file formats
- [x] Implement GET /api/spaces/{spaceId}/export/csv - Export transactions to CSV
- [x] Implement GET /api/spaces/{spaceId}/export/pdf-report - Generate PDF financial report
- [x] Implement GET /api/spaces/{spaceId}/export/excel - Export data to Excel format

### Business Logic & Services
- [x] Implement transaction logic for automatic account balance updates
- [ ] Create ProjectionsService for cash flow forecasting
- [ ] Create SavingsGoalService for goal progress tracking
- [ ] Implement endpoints to expose service results
- [x] Create CategoryService with usage statistics and expense totals
- [x] Create ExpenseService with filtering, pagination, and summaries
- [x] Create DTOs for Categories and Expenses for better API responses

### Testing
- [ ] Write xUnit tests for business logic services
- [ ] Write WebApplicationFactory integration tests
- [ ] Test authorization rules end-to-end

## Frontend Development (React PWA)

### Phase 1 (MVP - Personal Budgeting)

#### PWA Foundation
- [x] Initialize React project with PWA support (Vite PWA)
- [x] Configure manifest.json
- [ ] Set up service worker caching strategy

#### UI/UX & Layout
- [x] Select and set up UI component library/CSS framework (Material-UI)
- [x] Create main app layout with responsive navigation
- [x] Design bottom navigation (Wallet, Budgets, Insights)
- [x] Implement responsive Sidebar and MobileNav components
- [x] Create Header component with user menu and space selector

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
- [x] Extend API service layer for financial endpoints (accounts, expenses, incomes, budgets, goals)

#### Financial Management Pages
- [x] Build "Wallet/Accounts" page for account management
  - [x] List all accounts with balances
  - [x] Create/edit/delete accounts
  - [x] Account details view with transaction history
  - [x] Account balance tracking and updates
- [x] Build "Expenses" page for expense tracking
  - [x] Add new expense form with category and account selection
  - [x] List expenses with filtering and search
  - [x] Edit/delete existing expenses
  - [x] Expense summary views by category and time period
  - [x] Create ExpensesView, ExpenseCard, ExpenseForm, ExpenseList components
  - [x] Implement useExpenses and useExpenseForm custom hooks
- [x] Build "Income" page for income tracking
  - [x] Add new income form with account selection
  - [x] List incomes with filtering and search
  - [x] Edit/delete existing incomes
  - [x] Income summary and trends
  - [x] Create IncomeView, IncomeCard, IncomeForm, IncomeList components
  - [x] Implement useIncomes and useIncomeForm custom hooks
  - [x] Add income navigation to Sidebar and MobileNav
- [x] Build "Budgets" page for budget management
  - [x] Create/edit budget forms with category selection (AddBudgetForm)
  - [x] Budget progress displays with visual indicators
  - [x] Budget vs actual spending comparison
  - [x] Budget alerts and notifications
  - [x] Create BudgetsView component
- [x] Build "Savings Goals" page for goal tracking
  - [x] Create/edit savings goals (AddGoalForm)
  - [x] Goal progress visualization
  - [x] Contribution and withdrawal forms
  - [x] Goal achievement tracking
  - [x] Create GoalsView component

#### Categories Management
- [x] Create Categories management component
- [x] Category selection components for expenses/budgets
- [x] Category spending analysis views
- [x] Custom category creation and editing
- [x] Create CategoriesView, CategoryCard, CategoryForm, CategoryList components
- [x] Implement useCategories custom hook
- [x] Add color picker for category customization

#### Analytics & Reports Frontend
- [x] Build "Insights/Analytics" dashboard page
  - [x] Spending trends charts and graphs
  - [x] Income vs expenses comparison
  - [x] Category breakdown pie/bar charts
  - [x] Monthly/yearly financial summaries
  - [x] Net worth tracking over time
  - [x] Cash flow projections
- [x] Create interactive data visualization components
- [x] Implement export functionality (CSV, PDF reports)
- [x] Build responsive charts for mobile devices
- [x] Create ImportExportView with tabbed interface for import/export
- [x] Build CsvImportForm with customizable column mapping
- [x] Create DataExportForm with multiple export formats
- [x] Add import/export navigation items to sidebar and mobile nav

#### Forms & UI Components
- [x] Create reusable form components for financial data entry
- [x] Build amount input component with currency formatting
- [x] Create date picker components for transactions
- [x] Implement account selector dropdown component
- [x] Build category selector with icons
- [x] Create confirmation dialogs for delete operations
- [x] Implement loading states and error handling for all forms

### Phase 2 (V2 - Additional Features)
- [x] Create "Manage Spaces" page
- [x] Implement space-switcher in navigation UI
- [x] Enable collaborative space features
- [x] Add recurring transaction management (expenses and income)
- [x] Implement currency selection per space
- [x] Create currency formatting utilities and components
- [x] Add comprehensive import/export functionality

## Infrastructure & Deployment

### AWS Infrastructure (CDK)
- [ ] Set up AWS Lambda for API hosting
- [ ] Configure Amazon API Gateway
- [ ] Set up Amazon RDS Serverless v2 (PostgreSQL)
- [ ] Define all resources as CDK code

### Database Management
- [x] Set up Entity Framework Core Migrations
- [x] Configure dotnet ef command-line tools
- [x] Implement code-first migration workflow
- [x] Create migrations for Category Color property
- [x] Fixed DateTime UTC timezone issues for PostgreSQL compatibility
- [x] Reset database and migrations to clean state

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
- [x] Category (CategoryId, SpaceId, Name, Icon, Color)
- [x] Budget (BudgetId, SpaceId, CategoryId, Amount, StartDate, EndDate)
- [x] SavingsGoal (GoalId, SpaceId, Name, TargetAmount, CurrentAmount, TargetDate)

## Core Features Implementation Status
- [x] Multi-tenant "Space" architecture
- [x] User profile management and authentication
- [x] Space creation, management, and collaboration
- [x] User search and space member management
- [x] Activity dashboard and user insights
- [x] Wallet/Account management
- [x] Expense tracking (full implementation)
- [x] Income tracking (full implementation)
- [x] Budget management with visual feedback
- [x] Savings goals with progress tracking
- [x] Financial projections and forecasting
- [x] Data visualization & insights dashboard
- [x] Secure OAuth 2.0 authentication with PKCE
- [x] Collaborative spaces (V2) - Core functionality complete
- [x] Recurring transactions with automatic generation
- [x] Multi-currency support with space-level configuration
- [x] Import/Export functionality (CSV import, multiple export formats)
- [ ] Read-only offline access via service worker
