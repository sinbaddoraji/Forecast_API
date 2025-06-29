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
}