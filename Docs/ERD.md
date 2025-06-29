# Entity Relationship Diagram (ERD)

## Entities and Relationships

### Core Entities

#### User
- **Primary Key**: UserId (Guid)
- **Attributes**: Email, FirstName, LastName, AuthenticationProviderId, CreatedAt, UpdatedAt
- **Relationships**:
  - One-to-Many with **Space** (as Owner)
  - One-to-Many with **SpaceMember** (as User)  
  - One-to-Many with **Expense** (as AddedByUser)
  - One-to-Many with **Income** (as AddedByUser)

#### Space
- **Primary Key**: SpaceId (Guid)
- **Foreign Keys**: OwnerId → User.UserId
- **Attributes**: Name, CreatedAt, UpdatedAt
- **Relationships**:
  - Many-to-One with **User** (as Owner)
  - One-to-Many with **SpaceMember**
  - One-to-Many with **Account**
  - One-to-Many with **Expense**
  - One-to-Many with **Income**
  - One-to-Many with **Category**
  - One-to-Many with **Budget**
  - One-to-Many with **SavingsGoal**

#### SpaceMember (Junction Table)
- **Composite Primary Key**: UserId + SpaceId
- **Foreign Keys**: 
  - UserId → User.UserId
  - SpaceId → Space.SpaceId
- **Attributes**: Role (SpaceRole enum), JoinedAt
- **Relationships**:
  - Many-to-One with **User**
  - Many-to-One with **Space**

### Financial Entities

#### Account
- **Primary Key**: AccountId (Guid)
- **Foreign Keys**: SpaceId → Space.SpaceId
- **Attributes**: Name, Type (AccountType enum), StartingBalance, CurrentBalance, CreatedAt, UpdatedAt
- **Relationships**:
  - Many-to-One with **Space**
  - One-to-Many with **Expense**
  - One-to-Many with **Income**

#### Category
- **Primary Key**: CategoryId (Guid)
- **Foreign Keys**: SpaceId → Space.SpaceId
- **Attributes**: Name, CreatedAt, UpdatedAt
- **Relationships**:
  - Many-to-One with **Space**
  - One-to-Many with **Expense**
  - One-to-Many with **Budget**

#### Expense
- **Primary Key**: ExpenseId (Guid)
- **Foreign Keys**: 
  - SpaceId → Space.SpaceId
  - AccountId → Account.AccountId
  - AddedByUserId → User.UserId
  - CategoryId → Category.CategoryId
- **Attributes**: Title, Amount, Date, Notes, CreatedAt, UpdatedAt
- **Relationships**:
  - Many-to-One with **Space**
  - Many-to-One with **Account**
  - Many-to-One with **User** (as AddedByUser)
  - Many-to-One with **Category**

#### Income
- **Primary Key**: IncomeId (Guid)
- **Foreign Keys**: 
  - SpaceId → Space.SpaceId
  - AccountId → Account.AccountId
  - AddedByUserId → User.UserId
- **Attributes**: Title, Amount, Date, Notes, CreatedAt, UpdatedAt
- **Relationships**:
  - Many-to-One with **Space**
  - Many-to-One with **Account**
  - Many-to-One with **User** (as AddedByUser)

#### Budget
- **Primary Key**: BudgetId (Guid)
- **Foreign Keys**: 
  - SpaceId → Space.SpaceId
  - CategoryId → Category.CategoryId
- **Attributes**: Amount, StartDate, EndDate, CreatedAt, UpdatedAt
- **Relationships**:
  - Many-to-One with **Space**
  - Many-to-One with **Category**

#### SavingsGoal
- **Primary Key**: GoalId (Guid)
- **Foreign Keys**: SpaceId → Space.SpaceId
- **Attributes**: Name, TargetAmount, CurrentAmount, TargetDate, CreatedAt, UpdatedAt
- **Calculated Properties**: ProgressPercentage, IsCompleted
- **Relationships**:
  - Many-to-One with **Space**

### Enums

#### AccountType
- BankAccount
- MobileMoney
- Cash
- VirtualWallet

#### SpaceRole
- Member
- Owner

## Key Relationships Summary

1. **User-Space**: Users can own multiple spaces and be members of multiple spaces through SpaceMember
2. **Space-Centric**: All financial data (Accounts, Expenses, Income, Categories, Budgets, SavingsGoals) belongs to a Space
3. **Account-Transactions**: Expenses and Income are linked to specific Accounts
4. **Category-Budgeting**: Categories are used for both Expense categorization and Budget creation
5. **User-Transactions**: All Expenses and Income track which User added them
6. **Multi-tenant**: The Space entity provides multi-tenant isolation for all financial data

## Database Constraints

- All entities use Guid primary keys
- Foreign key relationships are enforced
- Required fields are marked with [Required] attribute
- Decimal fields use precision (18,2) for financial amounts
- String fields have appropriate max length constraints
- Composite primary key on SpaceMember (UserId + SpaceId)