using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Models.DTOs;
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
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomes(
        Guid spaceId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] Guid? accountId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var query = _context.Incomes
            .Where(i => i.SpaceId == spaceId)
            .Include(i => i.Account)
            .Include(i => i.AddedByUser)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(i => i.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(i => i.Date <= endDate.Value);

        if (accountId.HasValue)
            query = query.Where(i => i.AccountId == accountId.Value);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(i => i.Title.Contains(search) || (i.Notes != null && i.Notes.Contains(search)));

        var totalCount = await query.CountAsync();
        var incomes = await query
            .OrderByDescending(i => i.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers["X-Total-Count"] = totalCount.ToString();
        Response.Headers["X-Page"] = page.ToString();
        Response.Headers["X-Page-Size"] = pageSize.ToString();

        return incomes;
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
    public async Task<ActionResult<Income>> PostIncome(Guid spaceId, CreateIncomeDto createIncomeDto)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var user = await _userService.GetOrCreateUserAsync(User);
        
        // Verify the account belongs to this space
        var accountExists = await _context.Accounts.AnyAsync(a => a.AccountId == createIncomeDto.AccountId && a.SpaceId == spaceId);
        if (!accountExists)
        {
            return BadRequest("Account not found in this space.");
        }
        
        var income = new Income
        {
            IncomeId = Guid.NewGuid(),
            SpaceId = spaceId,
            AccountId = createIncomeDto.AccountId,
            Title = createIncomeDto.Title,
            Amount = createIncomeDto.Amount,
            Date = createIncomeDto.Date,
            Notes = createIncomeDto.Notes,
            AddedByUserId = user.UserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

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
    public async Task<IActionResult> PutIncome(Guid spaceId, Guid id, UpdateIncomeDto updateIncomeDto)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var existingIncome = await _context.Incomes.FirstOrDefaultAsync(i => i.IncomeId == id && i.SpaceId == spaceId);
        if (existingIncome == null)
        {
            return NotFound();
        }

        // Verify the new account belongs to this space
        var accountExists = await _context.Accounts.AnyAsync(a => a.AccountId == updateIncomeDto.AccountId && a.SpaceId == spaceId);
        if (!accountExists)
        {
            return BadRequest("Account not found in this space.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Update account balances
            if (existingIncome.AccountId != updateIncomeDto.AccountId || existingIncome.Amount != updateIncomeDto.Amount)
            {
                // Restore balance to old account (subtract the old income)
                var oldAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.AccountId == existingIncome.AccountId && a.SpaceId == spaceId);
                
                if (oldAccount != null)
                {
                    oldAccount.CurrentBalance -= existingIncome.Amount;
                    oldAccount.UpdatedAt = DateTime.UtcNow;
                }

                // Update balance on new account (add the new income)
                var newAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.AccountId == updateIncomeDto.AccountId && a.SpaceId == spaceId);
                
                if (newAccount != null)
                {
                    newAccount.CurrentBalance += updateIncomeDto.Amount;
                    newAccount.UpdatedAt = DateTime.UtcNow;
                }
            }

            existingIncome.AccountId = updateIncomeDto.AccountId;
            existingIncome.Title = updateIncomeDto.Title;
            existingIncome.Amount = updateIncomeDto.Amount;
            existingIncome.Date = updateIncomeDto.Date;
            existingIncome.Notes = updateIncomeDto.Notes;
            existingIncome.UpdatedAt = DateTime.UtcNow;

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

    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetIncomeSummary(
        Guid spaceId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string period = "monthly")
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var query = _context.Incomes.Where(i => i.SpaceId == spaceId);

        if (startDate.HasValue)
            query = query.Where(i => i.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(i => i.Date <= endDate.Value);

        var incomes = await query.ToListAsync();

        var summary = period.ToLower() switch
        {
            "weekly" => incomes.GroupBy(i => new { 
                    Year = i.Date.Year, 
                    Week = (i.Date.DayOfYear - 1) / 7 + 1 
                })
                .Select(g => new {
                    Period = $"{g.Key.Year}-W{g.Key.Week:00}",
                    TotalAmount = g.Sum(i => i.Amount),
                    Count = g.Count()
                })
                .OrderBy(x => x.Period)
                .ToList(),
            "yearly" => incomes.GroupBy(i => i.Date.Year)
                .Select(g => new {
                    Period = g.Key.ToString(),
                    TotalAmount = g.Sum(i => i.Amount),
                    Count = g.Count()
                })
                .OrderBy(x => x.Period)
                .ToList(),
            _ => incomes.GroupBy(i => new { i.Date.Year, i.Date.Month })
                .Select(g => new {
                    Period = $"{g.Key.Year}-{g.Key.Month:00}",
                    TotalAmount = g.Sum(i => i.Amount),
                    Count = g.Count()
                })
                .OrderBy(x => x.Period)
                .ToList()
        };

        return new {
            Period = period,
            StartDate = startDate,
            EndDate = endDate,
            TotalIncome = incomes.Sum(i => i.Amount),
            TotalCount = incomes.Count,
            Summary = summary
        };
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<Income>>> GetRecentIncomes(
        Guid spaceId,
        [FromQuery] int limit = 10)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        return await _context.Incomes
            .Where(i => i.SpaceId == spaceId)
            .Include(i => i.Account)
            .Include(i => i.AddedByUser)
            .OrderByDescending(i => i.Date)
            .Take(limit)
            .ToListAsync();
    }
}