using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Models;

namespace Forecast_API.Services;

public class ExpenseService : IExpenseService
{
    private readonly CoreDbContext _context;
    private readonly ILogger<ExpenseService> _logger;

    public ExpenseService(CoreDbContext context, ILogger<ExpenseService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Expense>> GetExpensesAsync(Guid spaceId, DateTime? startDate = null, DateTime? endDate = null, Guid? categoryId = null, Guid? accountId = null)
    {
        var query = _context.Expenses
            .Where(e => e.SpaceId == spaceId)
            .Include(e => e.Account)
            .Include(e => e.Category)
            .Include(e => e.AddedByUser)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(e => e.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(e => e.Date <= endDate.Value);

        if (categoryId.HasValue)
            query = query.Where(e => e.CategoryId == categoryId.Value);

        if (accountId.HasValue)
            query = query.Where(e => e.AccountId == accountId.Value);

        return await query.OrderByDescending(e => e.Date).ToListAsync();
    }

    public async Task<Expense?> GetExpenseByIdAsync(Guid spaceId, Guid expenseId)
    {
        return await _context.Expenses
            .Include(e => e.Account)
            .Include(e => e.Category)
            .Include(e => e.AddedByUser)
            .FirstOrDefaultAsync(e => e.ExpenseId == expenseId && e.SpaceId == spaceId);
    }

    public async Task<Expense> CreateExpenseAsync(Guid spaceId, Expense expense, Guid userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            expense.SpaceId = spaceId;
            expense.AddedByUserId = userId;
            expense.ExpenseId = Guid.NewGuid();
            expense.CreatedAt = DateTime.UtcNow;
            expense.UpdatedAt = DateTime.UtcNow;

            // Validate that the account belongs to the same space
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountId == expense.AccountId && a.SpaceId == spaceId);
            
            if (account == null)
            {
                throw new InvalidOperationException("Account not found or doesn't belong to this space");
            }

            // Validate that the category belongs to the same space
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == expense.CategoryId && c.SpaceId == spaceId);
            
            if (category == null)
            {
                throw new InvalidOperationException("Category not found or doesn't belong to this space");
            }

            _context.Expenses.Add(expense);
            
            // Update account balance
            account.CurrentBalance -= expense.Amount;
            account.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Created expense {ExpenseId} for space {SpaceId}", expense.ExpenseId, spaceId);

            // Reload with includes
            return (await GetExpenseByIdAsync(spaceId, expense.ExpenseId))!;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating expense for space {SpaceId}", spaceId);
            throw;
        }
    }

    public async Task<Expense?> UpdateExpenseAsync(Guid spaceId, Guid expenseId, Expense expense)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var existingExpense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.ExpenseId == expenseId && e.SpaceId == spaceId);

            if (existingExpense == null)
            {
                return null;
            }

            // Validate that the new account belongs to the same space
            if (expense.AccountId != existingExpense.AccountId)
            {
                var newAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.AccountId == expense.AccountId && a.SpaceId == spaceId);
                
                if (newAccount == null)
                {
                    throw new InvalidOperationException("Account not found or doesn't belong to this space");
                }
            }

            // Validate that the new category belongs to the same space
            if (expense.CategoryId != existingExpense.CategoryId)
            {
                var newCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryId == expense.CategoryId && c.SpaceId == spaceId);
                
                if (newCategory == null)
                {
                    throw new InvalidOperationException("Category not found or doesn't belong to this space");
                }
            }

            // Update account balances
            if (existingExpense.AccountId != expense.AccountId || existingExpense.Amount != expense.Amount)
            {
                // Restore balance to old account
                var oldAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.AccountId == existingExpense.AccountId && a.SpaceId == spaceId);
                
                if (oldAccount != null)
                {
                    oldAccount.CurrentBalance += existingExpense.Amount;
                    oldAccount.UpdatedAt = DateTime.UtcNow;
                }

                // Update balance on new account
                var newAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.AccountId == expense.AccountId && a.SpaceId == spaceId);
                
                if (newAccount != null)
                {
                    newAccount.CurrentBalance -= expense.Amount;
                    newAccount.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Update expense properties
            existingExpense.Title = expense.Title;
            existingExpense.Amount = expense.Amount;
            existingExpense.Date = expense.Date;
            existingExpense.CategoryId = expense.CategoryId;
            existingExpense.AccountId = expense.AccountId;
            existingExpense.Notes = expense.Notes;
            existingExpense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Updated expense {ExpenseId} for space {SpaceId}", expenseId, spaceId);

            // Reload with includes
            return await GetExpenseByIdAsync(spaceId, expenseId);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error updating expense {ExpenseId} for space {SpaceId}", expenseId, spaceId);
            throw;
        }
    }

    public async Task<bool> DeleteExpenseAsync(Guid spaceId, Guid expenseId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.ExpenseId == expenseId && e.SpaceId == spaceId);

            if (expense == null)
            {
                return false;
            }

            // Restore account balance
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountId == expense.AccountId && a.SpaceId == spaceId);
            
            if (account != null)
            {
                account.CurrentBalance += expense.Amount;
                account.UpdatedAt = DateTime.UtcNow;
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Deleted expense {ExpenseId} from space {SpaceId}", expenseId, spaceId);
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error deleting expense {ExpenseId} from space {SpaceId}", expenseId, spaceId);
            throw;
        }
    }

    public async Task<decimal> GetTotalExpensesByCategory(Guid spaceId, Guid categoryId, DateTime startDate, DateTime endDate)
    {
        return await _context.Expenses
            .Where(e => e.SpaceId == spaceId && 
                       e.CategoryId == categoryId && 
                       e.Date >= startDate && 
                       e.Date <= endDate)
            .SumAsync(e => e.Amount);
    }

    public async Task<Dictionary<Guid, decimal>> GetExpensesSummaryByCategory(Guid spaceId, DateTime startDate, DateTime endDate)
    {
        return await _context.Expenses
            .Where(e => e.SpaceId == spaceId && 
                       e.Date >= startDate && 
                       e.Date <= endDate)
            .GroupBy(e => e.CategoryId)
            .Select(g => new { CategoryId = g.Key, Total = g.Sum(e => e.Amount) })
            .ToDictionaryAsync(x => x.CategoryId, x => x.Total);
    }

    public async Task<decimal> GetTotalExpensesForPeriod(Guid spaceId, DateTime startDate, DateTime endDate)
    {
        return await _context.Expenses
            .Where(e => e.SpaceId == spaceId && 
                       e.Date >= startDate && 
                       e.Date <= endDate)
            .SumAsync(e => e.Amount);
    }

    public async Task<IEnumerable<Expense>> GetRecentExpenses(Guid spaceId, int count = 10)
    {
        return await _context.Expenses
            .Where(e => e.SpaceId == spaceId)
            .Include(e => e.Account)
            .Include(e => e.Category)
            .Include(e => e.AddedByUser)
            .OrderByDescending(e => e.Date)
            .Take(count)
            .ToListAsync();
    }
}