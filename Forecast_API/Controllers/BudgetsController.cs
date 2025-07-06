using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Data;
using Microsoft.EntityFrameworkCore;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;

    public BudgetsController(CoreDbContext context, IAuthorizationService authorizationService)
    {
        _context = context;
        _authorizationService = authorizationService;
    }

    private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
        return authorizationResult.Succeeded;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetBudgets(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var budgets = await _context.Budgets
            .Where(b => b.SpaceId == spaceId)
            .Include(b => b.Category)
            .Select(b => new
            {
                b.BudgetId,
                b.SpaceId,
                b.CategoryId,
                b.Amount,
                b.StartDate,
                b.EndDate,
                Category = b.Category,
                SpentAmount = _context.Expenses
                    .Where(e => e.SpaceId == spaceId && 
                               e.CategoryId == b.CategoryId && 
                               e.Date >= b.StartDate && 
                               e.Date <= b.EndDate)
                    .Sum(e => e.Amount)
            })
            .OrderBy(b => b.StartDate)
            .ToListAsync();

        return Ok(budgets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetBudget(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var budget = await _context.Budgets
            .Where(b => b.BudgetId == id && b.SpaceId == spaceId)
            .Include(b => b.Category)
            .Select(b => new
            {
                b.BudgetId,
                b.SpaceId,
                b.CategoryId,
                b.Amount,
                b.StartDate,
                b.EndDate,
                Category = b.Category,
                SpentAmount = _context.Expenses
                    .Where(e => e.SpaceId == spaceId && 
                               e.CategoryId == b.CategoryId && 
                               e.Date >= b.StartDate && 
                               e.Date <= b.EndDate)
                    .Sum(e => e.Amount)
            })
            .FirstOrDefaultAsync();

        if (budget == null)
        {
            return NotFound();
        }

        return Ok(budget);
    }

    [HttpPost]
    public async Task<ActionResult<Budget>> PostBudget(Guid spaceId, Budget budget)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == budget.CategoryId && c.SpaceId == spaceId);
        if (!categoryExists)
        {
            return BadRequest(new { error = "Category does not exist in this space" });
        }

        budget.SpaceId = spaceId;
        budget.BudgetId = Guid.NewGuid();
        
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBudget), new { spaceId = spaceId, id = budget.BudgetId }, budget);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutBudget(Guid spaceId, Guid id, Budget budget)
    {
        if (id != budget.BudgetId)
        {
            return BadRequest();
        }

        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        if (!_context.Budgets.Any(b => b.BudgetId == id && b.SpaceId == spaceId))
        {
            return NotFound();
        }

        var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == budget.CategoryId && c.SpaceId == spaceId);
        if (!categoryExists)
        {
            return BadRequest(new { error = "Category does not exist in this space" });
        }

        budget.SpaceId = spaceId;
        _context.Entry(budget).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Budgets.Any(b => b.BudgetId == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBudget(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var budget = await _context.Budgets.FirstOrDefaultAsync(b => b.BudgetId == id && b.SpaceId == spaceId);
        if (budget == null)
        {
            return NotFound();
        }

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("current")]
    public async Task<ActionResult<IEnumerable<object>>> GetCurrentBudgets(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var currentDate = DateTime.UtcNow;
        var budgets = await _context.Budgets
            .Where(b => b.SpaceId == spaceId && 
                       b.StartDate <= currentDate && 
                       b.EndDate >= currentDate)
            .Include(b => b.Category)
            .Select(b => new
            {
                b.BudgetId,
                b.SpaceId,
                b.CategoryId,
                b.Amount,
                b.StartDate,
                b.EndDate,
                Category = b.Category,
                SpentAmount = _context.Expenses
                    .Where(e => e.SpaceId == spaceId && 
                               e.CategoryId == b.CategoryId && 
                               e.Date >= b.StartDate && 
                               e.Date <= b.EndDate)
                    .Sum(e => e.Amount),
                PercentageUsed = b.Amount > 0 ? 
                    (_context.Expenses
                        .Where(e => e.SpaceId == spaceId && 
                                   e.CategoryId == b.CategoryId && 
                                   e.Date >= b.StartDate && 
                                   e.Date <= b.EndDate)
                        .Sum(e => e.Amount) / b.Amount) * 100 : 0,
                RemainingAmount = b.Amount - _context.Expenses
                    .Where(e => e.SpaceId == spaceId && 
                               e.CategoryId == b.CategoryId && 
                               e.Date >= b.StartDate && 
                               e.Date <= b.EndDate)
                    .Sum(e => e.Amount),
                DaysRemaining = (int)(b.EndDate - currentDate).TotalDays
            })
            .OrderBy(b => b.Category.Name)
            .ToListAsync();

        return Ok(budgets);
    }

    [HttpGet("{id}/progress")]
    public async Task<ActionResult<object>> GetBudgetProgress(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var budget = await _context.Budgets
            .Where(b => b.BudgetId == id && b.SpaceId == spaceId)
            .Include(b => b.Category)
            .FirstOrDefaultAsync();

        if (budget == null)
        {
            return NotFound();
        }

        var expenses = await _context.Expenses
            .Where(e => e.SpaceId == spaceId && 
                       e.CategoryId == budget.CategoryId && 
                       e.Date >= budget.StartDate && 
                       e.Date <= budget.EndDate)
            .OrderBy(e => e.Date)
            .ToListAsync();

        var totalSpent = expenses.Sum(e => e.Amount);
        var remainingAmount = budget.Amount - totalSpent;
        var percentageUsed = budget.Amount > 0 ? (totalSpent / budget.Amount) * 100 : 0;
        var currentDate = DateTime.UtcNow;
        var totalDays = (int)(budget.EndDate - budget.StartDate).TotalDays;
        var daysElapsed = (int)(currentDate - budget.StartDate).TotalDays;
        var daysRemaining = (int)(budget.EndDate - currentDate).TotalDays;
        var expectedSpendingRate = totalDays > 0 ? budget.Amount / totalDays : 0;
        var actualSpendingRate = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

        var dailySpending = expenses
            .GroupBy(e => e.Date.Date)
            .Select(g => new
            {
                Date = g.Key,
                Amount = g.Sum(e => e.Amount),
                TransactionCount = g.Count()
            })
            .OrderBy(d => d.Date)
            .ToList();

        var result = new
        {
            Budget = new
            {
                budget.BudgetId,
                budget.SpaceId,
                budget.CategoryId,
                budget.Amount,
                budget.StartDate,
                budget.EndDate,
                Category = budget.Category
            },
            Progress = new
            {
                TotalSpent = totalSpent,
                RemainingAmount = remainingAmount,
                PercentageUsed = Math.Round(percentageUsed, 2),
                DaysRemaining = daysRemaining,
                DaysElapsed = daysElapsed,
                TotalDays = totalDays,
                ExpectedSpendingRate = Math.Round(expectedSpendingRate, 2),
                ActualSpendingRate = Math.Round(actualSpendingRate, 2),
                IsOverBudget = totalSpent > budget.Amount,
                ProjectedTotalSpending = daysRemaining > 0 ? totalSpent + (actualSpendingRate * daysRemaining) : totalSpent
            },
            DailySpending = dailySpending,
            RecentExpenses = expenses.TakeLast(10).Select(e => new
            {
                e.ExpenseId,
                e.Title,
                e.Amount,
                e.Date,
                e.Notes
            })
        };

        return Ok(result);
    }

    [HttpGet("alerts")]
    public async Task<ActionResult<IEnumerable<object>>> GetBudgetAlerts(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var currentDate = DateTime.UtcNow;
        var alerts = new List<object>();

        var currentBudgets = await _context.Budgets
            .Where(b => b.SpaceId == spaceId && 
                       b.StartDate <= currentDate && 
                       b.EndDate >= currentDate)
            .Include(b => b.Category)
            .ToListAsync();

        foreach (var budget in currentBudgets)
        {
            var spentAmount = await _context.Expenses
                .Where(e => e.SpaceId == spaceId && 
                           e.CategoryId == budget.CategoryId && 
                           e.Date >= budget.StartDate && 
                           e.Date <= budget.EndDate)
                .SumAsync(e => e.Amount);

            var percentageUsed = budget.Amount > 0 ? (spentAmount / budget.Amount) * 100 : 0;
            var daysRemaining = (int)(budget.EndDate - currentDate).TotalDays;

            // Over budget alert
            if (spentAmount > budget.Amount)
            {
                alerts.Add(new
                {
                    Type = "over_budget",
                    Severity = "high",
                    BudgetId = budget.BudgetId,
                    CategoryName = budget.Category.Name,
                    Message = $"You've exceeded your budget for {budget.Category.Name} by {spentAmount - budget.Amount:C}",
                    BudgetAmount = budget.Amount,
                    SpentAmount = spentAmount,
                    OverageAmount = spentAmount - budget.Amount,
                    PercentageUsed = Math.Round(percentageUsed, 2)
                });
            }
            // High usage alert (80% threshold)
            else if (percentageUsed >= 80)
            {
                alerts.Add(new
                {
                    Type = "high_usage",
                    Severity = "medium",
                    BudgetId = budget.BudgetId,
                    CategoryName = budget.Category.Name,
                    Message = $"You've used {percentageUsed:F1}% of your {budget.Category.Name} budget",
                    BudgetAmount = budget.Amount,
                    SpentAmount = spentAmount,
                    RemainingAmount = budget.Amount - spentAmount,
                    PercentageUsed = Math.Round(percentageUsed, 2)
                });
            }
            // Budget ending soon alert (3 days remaining)
            else if (daysRemaining <= 3 && daysRemaining > 0)
            {
                alerts.Add(new
                {
                    Type = "ending_soon",
                    Severity = "low",
                    BudgetId = budget.BudgetId,
                    CategoryName = budget.Category.Name,
                    Message = $"Your {budget.Category.Name} budget period ends in {daysRemaining} day(s)",
                    BudgetAmount = budget.Amount,
                    SpentAmount = spentAmount,
                    RemainingAmount = budget.Amount - spentAmount,
                    DaysRemaining = daysRemaining,
                    PercentageUsed = Math.Round(percentageUsed, 2)
                });
            }
        }

        return Ok(alerts.OrderBy(a => a.GetType().GetProperty("Severity")?.GetValue(a)?.ToString() switch
        {
            "high" => 1,
            "medium" => 2,
            "low" => 3,
            _ => 4
        }));
    }
}