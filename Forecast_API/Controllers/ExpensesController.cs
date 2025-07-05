using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Models.DTOs;
using Forecast_API.Services;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;
    private readonly IAuthorizationService _authorizationService;
    private readonly IUserService _userService;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(
        IExpenseService expenseService,
        IAuthorizationService authorizationService,
        IUserService userService,
        ILogger<ExpensesController> logger)
    {
        _expenseService = expenseService;
        _authorizationService = authorizationService;
        _userService = userService;
        _logger = logger;
    }

    private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
        return authorizationResult.Succeeded;
    }

    private static ExpenseResponseDto MapToResponseDto(Expense expense)
    {
        return new ExpenseResponseDto
        {
            ExpenseId = expense.ExpenseId,
            SpaceId = expense.SpaceId,
            AccountId = expense.AccountId,
            AccountName = expense.Account?.Name ?? string.Empty,
            Title = expense.Title,
            Amount = expense.Amount,
            Date = expense.Date,
            AddedByUserId = expense.AddedByUserId,
            AddedByUserName = expense.AddedByUser != null ? 
                $"{expense.AddedByUser.FirstName} {expense.AddedByUser.LastName}".Trim() : string.Empty,
            CategoryId = expense.CategoryId,
            CategoryName = expense.Category?.Name ?? string.Empty,
            Notes = expense.Notes,
            CreatedAt = expense.CreatedAt,
            UpdatedAt = expense.UpdatedAt
        };
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseResponseDto>>> GetExpenses(
        Guid spaceId,
        [FromQuery] ExpenseFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var expenses = await _expenseService.GetExpensesAsync(
                spaceId,
                filter.StartDate,
                filter.EndDate,
                filter.CategoryId,
                filter.AccountId);

            if (filter.Limit.HasValue && filter.Limit.Value > 0)
            {
                expenses = expenses.Take(filter.Limit.Value);
            }

            var responseDtos = expenses.Select(MapToResponseDto);
            return Ok(responseDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expenses for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving expenses");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseResponseDto>> GetExpense(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var expense = await _expenseService.GetExpenseByIdAsync(spaceId, id);
            if (expense == null)
            {
                return NotFound();
            }

            return Ok(MapToResponseDto(expense));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expense {ExpenseId} for space {SpaceId}", id, spaceId);
            return StatusCode(500, "An error occurred while retrieving the expense");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseResponseDto>> PostExpense(Guid spaceId, CreateExpenseDto createDto)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);
            
            var expense = new Expense
            {
                AccountId = createDto.AccountId,
                Title = createDto.Title,
                Amount = createDto.Amount,
                Date = createDto.Date,
                CategoryId = createDto.CategoryId,
                Notes = createDto.Notes
            };

            var createdExpense = await _expenseService.CreateExpenseAsync(spaceId, expense, user.UserId);
            var responseDto = MapToResponseDto(createdExpense);

            return CreatedAtAction(
                nameof(GetExpense),
                new { spaceId = spaceId, id = createdExpense.ExpenseId },
                responseDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while creating expense for space {SpaceId}", spaceId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating expense for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while creating the expense");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutExpense(Guid spaceId, Guid id, UpdateExpenseDto updateDto)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var expense = new Expense
            {
                ExpenseId = id,
                AccountId = updateDto.AccountId,
                Title = updateDto.Title,
                Amount = updateDto.Amount,
                Date = updateDto.Date,
                CategoryId = updateDto.CategoryId,
                Notes = updateDto.Notes
            };

            var updatedExpense = await _expenseService.UpdateExpenseAsync(spaceId, id, expense);
            if (updatedExpense == null)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while updating expense {ExpenseId} for space {SpaceId}", id, spaceId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating expense {ExpenseId} for space {SpaceId}", id, spaceId);
            return StatusCode(500, "An error occurred while updating the expense");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var deleted = await _expenseService.DeleteExpenseAsync(spaceId, id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting expense {ExpenseId} from space {SpaceId}", id, spaceId);
            return StatusCode(500, "An error occurred while deleting the expense");
        }
    }

    [HttpGet("summary/by-category")]
    public async Task<ActionResult<Dictionary<Guid, decimal>>> GetExpensesSummaryByCategory(
        Guid spaceId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var summary = await _expenseService.GetExpensesSummaryByCategory(spaceId, startDate, endDate);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expenses summary for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving the expenses summary");
        }
    }

    [HttpGet("total")]
    public async Task<ActionResult<decimal>> GetTotalExpenses(
        Guid spaceId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var total = await _expenseService.GetTotalExpensesForPeriod(spaceId, startDate, endDate);
            return Ok(total);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving total expenses for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving the total expenses");
        }
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<ExpenseResponseDto>>> GetRecentExpenses(
        Guid spaceId,
        [FromQuery] int count = 10)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var expenses = await _expenseService.GetRecentExpenses(spaceId, count);
            var responseDtos = expenses.Select(MapToResponseDto);
            return Ok(responseDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent expenses for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving recent expenses");
        }
    }
}