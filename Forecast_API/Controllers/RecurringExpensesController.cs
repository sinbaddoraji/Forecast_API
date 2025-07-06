using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Data;
using Microsoft.EntityFrameworkCore;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class RecurringExpensesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;

    public RecurringExpensesController(CoreDbContext context, IAuthorizationService authorizationService)
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
    public async Task<ActionResult<IEnumerable<object>>> GetRecurringExpenses(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringExpenses = await _context.RecurringExpenses
            .Where(re => re.SpaceId == spaceId)
            .Include(re => re.Account)
            .Include(re => re.Category)
            .Include(re => re.CreatedByUser)
            .OrderBy(re => re.NextDueDate)
            .Select(re => new
            {
                re.RecurringExpenseId,
                re.SpaceId,
                re.AccountId,
                AccountName = re.Account.Name,
                re.Title,
                re.Amount,
                re.CategoryId,
                CategoryName = re.Category != null ? re.Category.Name : null,
                CategoryColor = re.Category != null ? re.Category.Color : null,
                re.Notes,
                re.Frequency,
                re.StartDate,
                re.EndDate,
                re.NextDueDate,
                re.LastGeneratedDate,
                re.IsActive,
                re.CreatedByUserId,
                CreatedByUserName = $"{re.CreatedByUser.FirstName} {re.CreatedByUser.LastName}",
                re.CreatedAt,
                re.UpdatedAt
            })
            .ToListAsync();

        return Ok(recurringExpenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetRecurringExpense(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringExpense = await _context.RecurringExpenses
            .Where(re => re.RecurringExpenseId == id && re.SpaceId == spaceId)
            .Include(re => re.Account)
            .Include(re => re.Category)
            .Include(re => re.CreatedByUser)
            .Select(re => new
            {
                re.RecurringExpenseId,
                re.SpaceId,
                re.AccountId,
                AccountName = re.Account.Name,
                re.Title,
                re.Amount,
                re.CategoryId,
                CategoryName = re.Category != null ? re.Category.Name : null,
                CategoryColor = re.Category != null ? re.Category.Color : null,
                re.Notes,
                re.Frequency,
                re.StartDate,
                re.EndDate,
                re.NextDueDate,
                re.LastGeneratedDate,
                re.IsActive,
                re.CreatedByUserId,
                CreatedByUserName = $"{re.CreatedByUser.FirstName} {re.CreatedByUser.LastName}",
                re.CreatedAt,
                re.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (recurringExpense == null)
        {
            return NotFound();
        }

        return Ok(recurringExpense);
    }

    [HttpPost]
    public async Task<ActionResult<RecurringExpense>> PostRecurringExpense(Guid spaceId, CreateRecurringExpenseDto dto)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var currentUserId = Guid.Parse(GetCurrentUserId());

        var recurringExpense = new RecurringExpense
        {
            RecurringExpenseId = Guid.NewGuid(),
            SpaceId = spaceId,
            AccountId = dto.AccountId,
            Title = dto.Title,
            Amount = dto.Amount,
            CategoryId = dto.CategoryId,
            Notes = dto.Notes,
            Frequency = dto.Frequency,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            NextDueDate = CalculateNextDueDate(dto.StartDate, dto.Frequency),
            IsActive = true,
            CreatedByUserId = currentUserId
        };

        _context.RecurringExpenses.Add(recurringExpense);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRecurringExpense), 
            new { spaceId = spaceId, id = recurringExpense.RecurringExpenseId }, 
            recurringExpense);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutRecurringExpense(Guid spaceId, Guid id, UpdateRecurringExpenseDto dto)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringExpense = await _context.RecurringExpenses
            .FirstOrDefaultAsync(re => re.RecurringExpenseId == id && re.SpaceId == spaceId);

        if (recurringExpense == null)
        {
            return NotFound();
        }

        recurringExpense.Title = dto.Title;
        recurringExpense.Amount = dto.Amount;
        recurringExpense.CategoryId = dto.CategoryId;
        recurringExpense.Notes = dto.Notes;
        recurringExpense.Frequency = dto.Frequency;
        recurringExpense.StartDate = dto.StartDate;
        recurringExpense.EndDate = dto.EndDate;
        recurringExpense.IsActive = dto.IsActive;
        recurringExpense.UpdatedAt = DateTime.UtcNow;

        // Recalculate next due date if frequency or start date changed
        if (dto.Frequency != recurringExpense.Frequency || dto.StartDate != recurringExpense.StartDate)
        {
            recurringExpense.NextDueDate = CalculateNextDueDate(dto.StartDate, dto.Frequency);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecurringExpense(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringExpense = await _context.RecurringExpenses
            .FirstOrDefaultAsync(re => re.RecurringExpenseId == id && re.SpaceId == spaceId);

        if (recurringExpense == null)
        {
            return NotFound();
        }

        _context.RecurringExpenses.Remove(recurringExpense);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/generate")]
    public async Task<ActionResult<object>> GenerateExpense(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var recurringExpense = await _context.RecurringExpenses
            .FirstOrDefaultAsync(re => re.RecurringExpenseId == id && re.SpaceId == spaceId);

        if (recurringExpense == null)
        {
            return NotFound();
        }

        if (!recurringExpense.IsActive)
        {
            return BadRequest(new { error = "Cannot generate expense from inactive recurring expense" });
        }

        var currentUserId = Guid.Parse(GetCurrentUserId());

        // Skip if no category is set (since it's required for expenses)
        if (recurringExpense.CategoryId == null)
        {
            return BadRequest(new { error = "Cannot generate expense without a category" });
        }

        // Create the actual expense
        var expense = new Expense
        {
            ExpenseId = Guid.NewGuid(),
            SpaceId = spaceId,
            AccountId = recurringExpense.AccountId,
            Title = recurringExpense.Title,
            Amount = recurringExpense.Amount,
            Date = DateTime.UtcNow,
            CategoryId = recurringExpense.CategoryId.Value,
            Notes = $"Generated from recurring expense: {recurringExpense.Notes}",
            AddedByUserId = currentUserId
        };

        _context.Expenses.Add(expense);

        // Update account balance
        var account = await _context.Accounts.FindAsync(recurringExpense.AccountId);
        if (account != null)
        {
            account.CurrentBalance -= recurringExpense.Amount;
            account.UpdatedAt = DateTime.UtcNow;
        }

        // Update recurring expense
        recurringExpense.LastGeneratedDate = DateTime.UtcNow;
        recurringExpense.NextDueDate = CalculateNextDueDate(recurringExpense.NextDueDate, recurringExpense.Frequency);
        recurringExpense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Expense generated successfully", 
            expenseId = expense.ExpenseId,
            nextDueDate = recurringExpense.NextDueDate
        });
    }

    [HttpGet("due")]
    public async Task<ActionResult<IEnumerable<object>>> GetDueRecurringExpenses(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var dueExpenses = await _context.RecurringExpenses
            .Where(re => re.SpaceId == spaceId && 
                        re.IsActive && 
                        re.NextDueDate <= DateTime.UtcNow)
            .Include(re => re.Account)
            .Include(re => re.Category)
            .OrderBy(re => re.NextDueDate)
            .Select(re => new
            {
                re.RecurringExpenseId,
                re.Title,
                re.Amount,
                AccountName = re.Account.Name,
                CategoryName = re.Category != null ? re.Category.Name : null,
                re.NextDueDate,
                re.Frequency
            })
            .ToListAsync();

        return Ok(dueExpenses);
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

public class CreateRecurringExpenseDto
{
    public Guid AccountId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Notes { get; set; }
    public RecurrenceFrequency Frequency { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class UpdateRecurringExpenseDto
{
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Notes { get; set; }
    public RecurrenceFrequency Frequency { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
}