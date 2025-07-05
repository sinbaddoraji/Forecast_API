using Forecast_API.Models;

namespace Forecast_API.Services;

public interface IExpenseService
{
    Task<IEnumerable<Expense>> GetExpensesAsync(Guid spaceId, DateTime? startDate = null, DateTime? endDate = null, Guid? categoryId = null, Guid? accountId = null);
    Task<Expense?> GetExpenseByIdAsync(Guid spaceId, Guid expenseId);
    Task<Expense> CreateExpenseAsync(Guid spaceId, Expense expense, Guid userId);
    Task<Expense?> UpdateExpenseAsync(Guid spaceId, Guid expenseId, Expense expense);
    Task<bool> DeleteExpenseAsync(Guid spaceId, Guid expenseId);
    Task<decimal> GetTotalExpensesByCategory(Guid spaceId, Guid categoryId, DateTime startDate, DateTime endDate);
    Task<Dictionary<Guid, decimal>> GetExpensesSummaryByCategory(Guid spaceId, DateTime startDate, DateTime endDate);
    Task<decimal> GetTotalExpensesForPeriod(Guid spaceId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<Expense>> GetRecentExpenses(Guid spaceId, int count = 10);
}