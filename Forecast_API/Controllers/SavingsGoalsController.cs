using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Data;
using Microsoft.EntityFrameworkCore;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class SavingsGoalsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;

    public SavingsGoalsController(CoreDbContext context, IAuthorizationService authorizationService)
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
    public async Task<ActionResult<IEnumerable<SavingsGoal>>> GetSavingsGoals(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        return await _context.SavingsGoals
            .Where(sg => sg.SpaceId == spaceId)
            .OrderBy(sg => sg.TargetDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SavingsGoal>> GetSavingsGoal(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var savingsGoal = await _context.SavingsGoals.FirstOrDefaultAsync(sg => sg.GoalId == id && sg.SpaceId == spaceId);

        if (savingsGoal == null)
        {
            return NotFound();
        }

        return savingsGoal;
    }

    [HttpPost]
    public async Task<ActionResult<SavingsGoal>> PostSavingsGoal(Guid spaceId, SavingsGoal savingsGoal)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        savingsGoal.SpaceId = spaceId;
        savingsGoal.GoalId = Guid.NewGuid();
        savingsGoal.CurrentAmount = 0; // Initialize current amount
        
        _context.SavingsGoals.Add(savingsGoal);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSavingsGoal), new { spaceId = spaceId, id = savingsGoal.GoalId }, savingsGoal);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutSavingsGoal(Guid spaceId, Guid id, SavingsGoal savingsGoal)
    {
        if (id != savingsGoal.GoalId)
        {
            return BadRequest();
        }

        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        if (!_context.SavingsGoals.Any(sg => sg.GoalId == id && sg.SpaceId == spaceId))
        {
            return NotFound();
        }

        savingsGoal.SpaceId = spaceId;
        _context.Entry(savingsGoal).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.SavingsGoals.Any(sg => sg.GoalId == id))
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
    public async Task<IActionResult> DeleteSavingsGoal(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var savingsGoal = await _context.SavingsGoals.FirstOrDefaultAsync(sg => sg.GoalId == id && sg.SpaceId == spaceId);
        if (savingsGoal == null)
        {
            return NotFound();
        }

        _context.SavingsGoals.Remove(savingsGoal);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/contribute")]
    public async Task<IActionResult> ContributeToGoal(Guid spaceId, Guid id, [FromBody] decimal amount)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        if (amount <= 0)
        {
            return BadRequest(new { error = "Contribution amount must be positive" });
        }

        var savingsGoal = await _context.SavingsGoals.FirstOrDefaultAsync(sg => sg.GoalId == id && sg.SpaceId == spaceId);
        if (savingsGoal == null)
        {
            return NotFound();
        }

        // Create transaction record
        var transaction = new SavingsGoalTransaction
        {
            TransactionId = Guid.NewGuid(),
            GoalId = id,
            SpaceId = spaceId,
            Amount = amount,
            Type = SavingsGoalTransactionType.Contribution,
            Date = DateTime.UtcNow
        };

        _context.SavingsGoalTransactions.Add(transaction);

        savingsGoal.CurrentAmount += amount;
        savingsGoal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Contribution added successfully", currentAmount = savingsGoal.CurrentAmount });
    }

    [HttpPost("{id}/withdraw")]
    public async Task<IActionResult> WithdrawFromGoal(Guid spaceId, Guid id, [FromBody] decimal amount)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        if (amount <= 0)
        {
            return BadRequest(new { error = "Withdrawal amount must be positive" });
        }

        var savingsGoal = await _context.SavingsGoals.FirstOrDefaultAsync(sg => sg.GoalId == id && sg.SpaceId == spaceId);
        if (savingsGoal == null)
        {
            return NotFound();
        }

        if (savingsGoal.CurrentAmount < amount)
        {
            return BadRequest(new { error = "Insufficient funds for withdrawal", currentAmount = savingsGoal.CurrentAmount });
        }

        // Create transaction record
        var transaction = new SavingsGoalTransaction
        {
            TransactionId = Guid.NewGuid(),
            GoalId = id,
            SpaceId = spaceId,
            Amount = amount,
            Type = SavingsGoalTransactionType.Withdrawal,
            Date = DateTime.UtcNow
        };

        _context.SavingsGoalTransactions.Add(transaction);

        savingsGoal.CurrentAmount -= amount;
        savingsGoal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Withdrawal processed successfully", currentAmount = savingsGoal.CurrentAmount });
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<IEnumerable<object>>> GetGoalHistory(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        // Verify goal exists and belongs to space
        var goalExists = await _context.SavingsGoals.AnyAsync(sg => sg.GoalId == id && sg.SpaceId == spaceId);
        if (!goalExists)
        {
            return NotFound();
        }

        var transactions = await _context.SavingsGoalTransactions
            .Where(sgt => sgt.GoalId == id && sgt.SpaceId == spaceId)
            .OrderByDescending(sgt => sgt.Date)
            .Select(sgt => new
            {
                sgt.TransactionId,
                sgt.Amount,
                sgt.Type,
                sgt.Notes,
                sgt.Date,
                sgt.CreatedAt
            })
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetGoalsSummary(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var goals = await _context.SavingsGoals
            .Where(sg => sg.SpaceId == spaceId)
            .ToListAsync();

        var totalTargetAmount = goals.Sum(g => g.TargetAmount);
        var totalCurrentAmount = goals.Sum(g => g.CurrentAmount);
        var completedGoals = goals.Count(g => g.IsCompleted);
        var activeGoals = goals.Count(g => !g.IsCompleted);
        var overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

        // Get recent transactions across all goals
        var recentTransactions = await _context.SavingsGoalTransactions
            .Where(sgt => sgt.SpaceId == spaceId)
            .Include(sgt => sgt.SavingsGoal)
            .OrderByDescending(sgt => sgt.Date)
            .Take(10)
            .Select(sgt => new
            {
                sgt.TransactionId,
                sgt.Amount,
                sgt.Type,
                sgt.Date,
                GoalName = sgt.SavingsGoal!.Name
            })
            .ToListAsync();

        // Goals by completion status
        var goalsProgress = goals.Select(g => new
        {
            g.GoalId,
            g.Name,
            g.TargetAmount,
            g.CurrentAmount,
            g.ProgressPercentage,
            g.IsCompleted,
            g.TargetDate,
            DaysRemaining = g.TargetDate.HasValue ? (int)(g.TargetDate.Value - DateTime.UtcNow).TotalDays : (int?)null
        }).OrderByDescending(g => g.ProgressPercentage).ToList();

        var summary = new
        {
            TotalGoals = goals.Count,
            ActiveGoals = activeGoals,
            CompletedGoals = completedGoals,
            TotalTargetAmount = totalTargetAmount,
            TotalCurrentAmount = totalCurrentAmount,
            OverallProgress = Math.Round(overallProgress, 2),
            RecentTransactions = recentTransactions,
            GoalsProgress = goalsProgress
        };

        return Ok(summary);
    }
}