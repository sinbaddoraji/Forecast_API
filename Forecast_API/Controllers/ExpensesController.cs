using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Data;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Services;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;
    private readonly IUserService _userService;

    public ExpensesController(CoreDbContext context, IAuthorizationService authorizationService, IUserService userService)
    {
        _context = context;
        _authorizationService = authorizationService;
        _userService = userService;
    }

    private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
        return authorizationResult.Succeeded;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        return await _context.Expenses
            .Where(e => e.SpaceId == spaceId)
            .Include(e => e.Account)
            .Include(e => e.Category)
            .Include(e => e.AddedByUser)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetExpense(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var expense = await _context.Expenses
            .Include(e => e.Account)
            .Include(e => e.Category)
            .Include(e => e.AddedByUser)
            .FirstOrDefaultAsync(e => e.ExpenseId == id && e.SpaceId == spaceId);

        if (expense == null)
        {
            return NotFound();
        }

        return expense;
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> PostExpense(Guid spaceId, Expense expense)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var user = await _userService.GetOrCreateUserAsync(User);
        
        expense.SpaceId = spaceId;
        expense.AddedByUserId = user.UserId;
        expense.ExpenseId = Guid.NewGuid();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Expenses.Add(expense);
            
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == expense.AccountId && a.SpaceId == spaceId);
            if (account != null)
            {
                account.CurrentBalance -= expense.Amount;
                account.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetExpense), new { spaceId = spaceId, id = expense.ExpenseId }, expense);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutExpense(Guid spaceId, Guid id, Expense expense)
    {
        if (id != expense.ExpenseId)
        {
            return BadRequest();
        }

        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var existingExpense = await _context.Expenses.FirstOrDefaultAsync(e => e.ExpenseId == id && e.SpaceId == spaceId);
        if (existingExpense == null)
        {
            return NotFound();
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == existingExpense.AccountId && a.SpaceId == spaceId);
            if (account != null)
            {
                account.CurrentBalance += existingExpense.Amount;
                account.CurrentBalance -= expense.Amount;
                account.UpdatedAt = DateTime.UtcNow;
            }

            expense.SpaceId = spaceId;
            expense.AddedByUserId = existingExpense.AddedByUserId;
            _context.Entry(existingExpense).CurrentValues.SetValues(expense);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            if (!_context.Expenses.Any(e => e.ExpenseId == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.ExpenseId == id && e.SpaceId == spaceId);
        if (expense == null)
        {
            return NotFound();
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == expense.AccountId && a.SpaceId == spaceId);
            if (account != null)
            {
                account.CurrentBalance += expense.Amount;
                account.UpdatedAt = DateTime.UtcNow;
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}