using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Data;
using Microsoft.EntityFrameworkCore;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;

    public CategoriesController(CoreDbContext context, IAuthorizationService authorizationService)
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
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories(Guid spaceId)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        return await _context.Categories
            .Where(c => c.SpaceId == spaceId)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == id && c.SpaceId == spaceId);

        if (category == null)
        {
            return NotFound();
        }

        return category;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> PostCategory(Guid spaceId, Category category)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        category.SpaceId = spaceId;
        category.CategoryId = Guid.NewGuid();
        
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { spaceId = spaceId, id = category.CategoryId }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategory(Guid spaceId, Guid id, Category category)
    {
        if (id != category.CategoryId)
        {
            return BadRequest();
        }

        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        if (!_context.Categories.Any(c => c.CategoryId == id && c.SpaceId == spaceId))
        {
            return NotFound();
        }

        category.SpaceId = spaceId;
        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Categories.Any(c => c.CategoryId == id))
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
    public async Task<IActionResult> DeleteCategory(Guid spaceId, Guid id)
    {
        if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

        var category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == id && c.SpaceId == spaceId);
        if (category == null)
        {
            return NotFound();
        }

        var hasExpenses = await _context.Expenses.AnyAsync(e => e.CategoryId == id);
        if (hasExpenses)
        {
            return BadRequest(new { error = "Cannot delete category with associated expenses" });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}