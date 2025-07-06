using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Data;
using Microsoft.EntityFrameworkCore;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class RecurringIncomesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;

    public RecurringIncomesController(CoreDbContext context, IAuthorizationService authorizationService)
    {
        _context = context;
        _authorizationService = authorizationService;
    }

    private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
        return authorizationResult.Succeeded;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetRecurringIncomes(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringIncomes = await _context.RecurringIncomes
            .Where(ri => ri.SpaceId == spaceId)
            .Include(ri => ri.Account)
            .Include(ri => ri.CreatedByUser)
            .OrderBy(ri => ri.NextDueDate)
            .Select(ri => new
            {
                ri.RecurringIncomeId,
                ri.SpaceId,
                ri.AccountId,
                AccountName = ri.Account.Name,
                ri.Title,
                ri.Amount,
                ri.Notes,
                ri.Frequency,
                ri.StartDate,
                ri.EndDate,
                ri.NextDueDate,
                ri.LastGeneratedDate,
                ri.IsActive,
                ri.CreatedByUserId,
                CreatedByUserName = $"{ri.CreatedByUser.FirstName} {ri.CreatedByUser.LastName}",
                ri.CreatedAt,
                ri.UpdatedAt
            })
            .ToListAsync();

        return Ok(recurringIncomes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetRecurringIncome(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringIncome = await _context.RecurringIncomes
            .Where(ri => ri.RecurringIncomeId == id && ri.SpaceId == spaceId)
            .Include(ri => ri.Account)
            .Include(ri => ri.CreatedByUser)
            .Select(ri => new
            {
                ri.RecurringIncomeId,
                ri.SpaceId,
                ri.AccountId,
                AccountName = ri.Account.Name,
                ri.Title,
                ri.Amount,
                ri.Notes,
                ri.Frequency,
                ri.StartDate,
                ri.EndDate,
                ri.NextDueDate,
                ri.LastGeneratedDate,
                ri.IsActive,
                ri.CreatedByUserId,
                CreatedByUserName = $"{ri.CreatedByUser.FirstName} {ri.CreatedByUser.LastName}",
                ri.CreatedAt,
                ri.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (recurringIncome == null)
        {
            return NotFound();
        }

        return Ok(recurringIncome);
    }

    [HttpPost]
    public async Task<ActionResult<RecurringIncome>> PostRecurringIncome(Guid spaceId, CreateRecurringIncomeDto dto)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var currentUserId = Guid.Parse(GetCurrentUserId());

        var recurringIncome = new RecurringIncome
        {
            RecurringIncomeId = Guid.NewGuid(),
            SpaceId = spaceId,
            AccountId = dto.AccountId,
            Title = dto.Title,
            Amount = dto.Amount,
            Notes = dto.Notes,
            Frequency = dto.Frequency,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            NextDueDate = CalculateNextDueDate(dto.StartDate, dto.Frequency),
            IsActive = true,
            CreatedByUserId = currentUserId
        };

        _context.RecurringIncomes.Add(recurringIncome);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRecurringIncome), 
            new { spaceId = spaceId, id = recurringIncome.RecurringIncomeId }, 
            recurringIncome);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutRecurringIncome(Guid spaceId, Guid id, UpdateRecurringIncomeDto dto)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringIncome = await _context.RecurringIncomes
            .FirstOrDefaultAsync(ri => ri.RecurringIncomeId == id && ri.SpaceId == spaceId);

        if (recurringIncome == null)
        {
            return NotFound();
        }

        recurringIncome.Title = dto.Title;
        recurringIncome.Amount = dto.Amount;
        recurringIncome.Notes = dto.Notes;
        recurringIncome.Frequency = dto.Frequency;
        recurringIncome.StartDate = dto.StartDate;
        recurringIncome.EndDate = dto.EndDate;
        recurringIncome.IsActive = dto.IsActive;
        recurringIncome.UpdatedAt = DateTime.UtcNow;

        // Recalculate next due date if frequency or start date changed
        if (dto.Frequency != recurringIncome.Frequency || dto.StartDate != recurringIncome.StartDate)
        {
            recurringIncome.NextDueDate = CalculateNextDueDate(dto.StartDate, dto.Frequency);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecurringIncome(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringIncome = await _context.RecurringIncomes
            .FirstOrDefaultAsync(ri => ri.RecurringIncomeId == id && ri.SpaceId == spaceId);

        if (recurringIncome == null)
        {
            return NotFound();
        }

        _context.RecurringIncomes.Remove(recurringIncome);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/generate")]
    public async Task<ActionResult<object>> GenerateIncome(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringIncome = await _context.RecurringIncomes
            .FirstOrDefaultAsync(ri => ri.RecurringIncomeId == id && ri.SpaceId == spaceId);

        if (recurringIncome == null)
        {
            return NotFound();
        }

        if (!recurringIncome.IsActive)
        {
            return BadRequest(new { error = "Cannot generate income from inactive recurring income" });
        }

        var currentUserId = Guid.Parse(GetCurrentUserId());

        // Create the actual income
        var income = new Income
        {
            IncomeId = Guid.NewGuid(),
            SpaceId = spaceId,
            AccountId = recurringIncome.AccountId,
            Title = recurringIncome.Title,
            Amount = recurringIncome.Amount,
            Date = DateTime.UtcNow,
            Notes = $"Generated from recurring income: {recurringIncome.Notes}",
            AddedByUserId = currentUserId
        };

        _context.Incomes.Add(income);

        // Update account balance
        var account = await _context.Accounts.FindAsync(recurringIncome.AccountId);
        if (account != null)
        {
            account.CurrentBalance += recurringIncome.Amount;
            account.UpdatedAt = DateTime.UtcNow;
        }

        // Update recurring income
        recurringIncome.LastGeneratedDate = DateTime.UtcNow;
        recurringIncome.NextDueDate = CalculateNextDueDate(recurringIncome.NextDueDate, recurringIncome.Frequency);
        recurringIncome.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Income generated successfully", 
            incomeId = income.IncomeId,
            nextDueDate = recurringIncome.NextDueDate
        });
    }

    [HttpGet("due")]
    public async Task<ActionResult<IEnumerable<object>>> GetDueRecurringIncomes(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var dueIncomes = await _context.RecurringIncomes
            .Where(ri => ri.SpaceId == spaceId && 
                        ri.IsActive && 
                        ri.NextDueDate <= DateTime.UtcNow)
            .Include(ri => ri.Account)
            .OrderBy(ri => ri.NextDueDate)
            .Select(ri => new
            {
                ri.RecurringIncomeId,
                ri.Title,
                ri.Amount,
                AccountName = ri.Account.Name,
                ri.NextDueDate,
                ri.Frequency
            })
            .ToListAsync();

        return Ok(dueIncomes);
    }

    private static DateTime CalculateNextDueDate(DateTime baseDate, RecurrenceFrequency frequency)
    {
        return frequency switch
        {
            RecurrenceFrequency.Daily => baseDate.AddDays(1),
            RecurrenceFrequency.Weekly => baseDate.AddDays(7),
            RecurrenceFrequency.Monthly => baseDate.AddMonths(1),
            RecurrenceFrequency.Quarterly => baseDate.AddMonths(3),
            RecurrenceFrequency.Yearly => baseDate.AddYears(1),
            _ => baseDate.AddMonths(1)
        };
    }
}

public class CreateRecurringIncomeDto
{
    public Guid AccountId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public RecurrenceFrequency Frequency { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class UpdateRecurringIncomeDto
{
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public RecurrenceFrequency Frequency { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
}