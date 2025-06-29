using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Data;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Services;

namespace Forecast_API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/spaces/{spaceId}/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly CoreDbContext _context;
        private readonly IAuthorizationService _authorizationService;
        private readonly IUserService _userService;

        public AccountsController(CoreDbContext context, IAuthorizationService authorizationService, IUserService userService)
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

        // GET: api/spaces/{spaceId}/accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccounts(Guid spaceId)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            return await _context.Accounts.Where(a => a.SpaceId == spaceId).ToListAsync();
        }

        // GET: api/spaces/{spaceId}/accounts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Account>> GetAccount(Guid spaceId, Guid id)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == id && a.SpaceId == spaceId);

            if (account == null)
            {
                return NotFound();
            }

            return account;
        }

        // POST: api/spaces/{spaceId}/accounts
        [HttpPost]
        public async Task<ActionResult<Account>> PostAccount(Guid spaceId, Account account)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            // Ensure the account is associated with the correct space
            account.SpaceId = spaceId;
            
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAccount), new { spaceId = spaceId, id = account.AccountId }, account);
        }

        // PUT: api/spaces/{spaceId}/accounts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccount(Guid spaceId, Guid id, Account account)
        {
            if (id != account.AccountId)
            {
                return BadRequest();
            }

            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();
            
            // Ensure the entity being updated belongs to the correct space
            if (!_context.Accounts.Any(a => a.AccountId == id && a.SpaceId == spaceId))
            {
                return NotFound();
            }

            _context.Entry(account).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Accounts.Any(e => e.AccountId == id))
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

        // DELETE: api/spaces/{spaceId}/accounts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(Guid spaceId, Guid id)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == id && a.SpaceId == spaceId);
            if (account == null)
            {
                return NotFound();
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
