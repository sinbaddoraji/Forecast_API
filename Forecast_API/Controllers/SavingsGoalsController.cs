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

        savingsGoal.CurrentAmount += amount;
        savingsGoal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Contribution added successfully", currentAmount = savingsGoal.CurrentAmount });
    }
}