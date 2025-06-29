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
public class IncomesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;
    private readonly IUserService _userService;

    public IncomesController(CoreDbContext context, IAuthorizationService authorizationService, IUserService userService)
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
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomes(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        return await _context.Incomes
            .Where(i => i.SpaceId == spaceId)
            .Include(i => i.Account)
            .Include(i => i.AddedByUser)
            .OrderByDescending(i => i.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Income>> GetIncome(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var income = await _context.Incomes
            .Include(i => i.Account)
            .Include(i => i.AddedByUser)
            .FirstOrDefaultAsync(i => i.IncomeId == id && i.SpaceId == spaceId);

        if (income == null)
        {
            return NotFound();
        }

        return income;
    }

    [HttpPost]
    public async Task<ActionResult<Income>> PostIncome(Guid spaceId, Income income)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var user = await _userService.GetOrCreateUserAsync(User);
        
        income.SpaceId = spaceId;
        income.AddedByUserId = user.UserId;
        income.IncomeId = Guid.NewGuid();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Incomes.Add(income);
            
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == income.AccountId && a.SpaceId == spaceId);
            if (account != null)
            {
                account.CurrentBalance += income.Amount;
                account.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetIncome), new { spaceId = spaceId, id = income.IncomeId }, income);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutIncome(Guid spaceId, Guid id, Income income)
    {
        if (id != income.IncomeId)
        {
            return BadRequest();
        }

        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var existingIncome = await _context.Incomes.FirstOrDefaultAsync(i => i.IncomeId == id && i.SpaceId == spaceId);
        if (existingIncome == null)
        {
            return NotFound();
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == existingIncome.AccountId && a.SpaceId == spaceId);
            if (account != null)
            {
                account.CurrentBalance -= existingIncome.Amount;
                account.CurrentBalance += income.Amount;
                account.UpdatedAt = DateTime.UtcNow;
            }

            income.SpaceId = spaceId;
            income.AddedByUserId = existingIncome.AddedByUserId;
            _context.Entry(existingIncome).CurrentValues.SetValues(income);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            if (!_context.Incomes.Any(i => i.IncomeId == id))
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
    public async Task<IActionResult> DeleteIncome(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var income = await _context.Incomes.FirstOrDefaultAsync(i => i.IncomeId == id && i.SpaceId == spaceId);
        if (income == null)
        {
            return NotFound();
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == income.AccountId && a.SpaceId == spaceId);
            if (account != null)
            {
                account.CurrentBalance -= income.Amount;
                account.UpdatedAt = DateTime.UtcNow;
            }

            _context.Incomes.Remove(income);
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