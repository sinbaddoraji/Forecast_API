using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Forecast_API.Models;
using Forecast_API.Models.DTOs;
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

        private AccountType MapAccountType(string frontendType)
        {
            return frontendType.ToLower() switch
            {
                "checking" => AccountType.BankAccount,
                "savings" => AccountType.BankAccount,
                "creditcard" => AccountType.VirtualWallet,
                "cash" => AccountType.Cash,
                "investment" => AccountType.VirtualWallet,
                "other" => AccountType.VirtualWallet,
                _ => AccountType.BankAccount
            };
        }

        private string MapAccountTypeToFrontend(AccountType backendType)
        {
            return backendType switch
            {
                AccountType.BankAccount => "Checking",
                AccountType.MobileMoney => "Other",
                AccountType.Cash => "Cash",
                AccountType.VirtualWallet => "Other",
                _ => "Other"
            };
        }

        // GET: api/spaces/{spaceId}/accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAccounts(Guid spaceId)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            var accounts = await _context.Accounts.Where(a => a.SpaceId == spaceId).ToListAsync();
            
            var accountsWithMappedTypes = accounts.Select(a => new
            {
                AccountId = a.AccountId,
                SpaceId = a.SpaceId,
                Name = a.Name,
                Type = MapAccountTypeToFrontend(a.Type),
                StartingBalance = a.StartingBalance,
                CurrentBalance = a.CurrentBalance,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            });

            return Ok(accountsWithMappedTypes);
        }

        // GET: api/spaces/{spaceId}/accounts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetAccount(Guid spaceId, Guid id)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == id && a.SpaceId == spaceId);

            if (account == null)
            {
                return NotFound();
            }

            return new
            {
                AccountId = account.AccountId,
                SpaceId = account.SpaceId,
                Name = account.Name,
                Type = MapAccountTypeToFrontend(account.Type),
                StartingBalance = account.StartingBalance,
                CurrentBalance = account.CurrentBalance,
                CreatedAt = account.CreatedAt,
                UpdatedAt = account.UpdatedAt
            };
        }

        // POST: api/spaces/{spaceId}/accounts
        [HttpPost]
        public async Task<ActionResult<object>> PostAccount(Guid spaceId, CreateAccountDto createAccountDto)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                SpaceId = spaceId,
                Name = createAccountDto.Name,
                Type = MapAccountType(createAccountDto.Type),
                StartingBalance = createAccountDto.StartingBalance,
                CurrentBalance = createAccountDto.StartingBalance,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var response = new
            {
                AccountId = account.AccountId,
                SpaceId = account.SpaceId,
                Name = account.Name,
                Type = MapAccountTypeToFrontend(account.Type),
                StartingBalance = account.StartingBalance,
                CurrentBalance = account.CurrentBalance,
                CreatedAt = account.CreatedAt,
                UpdatedAt = account.UpdatedAt
            };

            return CreatedAtAction(nameof(GetAccount), new { spaceId = spaceId, id = account.AccountId }, response);
        }

        // PUT: api/spaces/{spaceId}/accounts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccount(Guid spaceId, Guid id, UpdateAccountDto updateAccountDto)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == id && a.SpaceId == spaceId);
            if (existingAccount == null)
            {
                return NotFound();
            }

            // Update only allowed fields
            existingAccount.Name = updateAccountDto.Name;
            existingAccount.Type = MapAccountType(updateAccountDto.Type);
            existingAccount.CurrentBalance = updateAccountDto.CurrentBalance;
            existingAccount.UpdatedAt = DateTime.UtcNow;

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

        // GET: api/spaces/{spaceId}/accounts/{id}/balance
        [HttpGet("{id}/balance")]
        public async Task<ActionResult<object>> GetAccountBalance(Guid spaceId, Guid id)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == id && a.SpaceId == spaceId);
            if (account == null)
            {
                return NotFound();
            }

            return new
            {
                AccountId = account.AccountId,
                Name = account.Name,
                CurrentBalance = account.CurrentBalance,
                StartingBalance = account.StartingBalance,
                LastUpdated = account.UpdatedAt
            };
        }

        // GET: api/spaces/{spaceId}/accounts/{id}/transactions
        [HttpGet("{id}/transactions")]
        public async Task<ActionResult<object>> GetAccountTransactions(Guid spaceId, Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (!await IsUserMemberOfSpace(spaceId)) return Forbid();

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == id && a.SpaceId == spaceId);
            if (account == null)
            {
                return NotFound();
            }

            // Get expenses for this account
            var expenses = await _context.Expenses
                .Where(e => e.AccountId == id && e.SpaceId == spaceId)
                .Select(e => new
                {
                    Id = e.ExpenseId,
                    Type = "Expense",
                    Title = e.Title,
                    Amount = -e.Amount, // Negative for expense
                    Date = e.Date,
                    CategoryId = e.CategoryId,
                    Notes = e.Notes
                })
                .ToListAsync();

            // Get incomes for this account
            var incomes = await _context.Incomes
                .Where(i => i.AccountId == id && i.SpaceId == spaceId)
                .Select(i => new
                {
                    Id = i.IncomeId,
                    Type = "Income",
                    Title = i.Title,
                    Amount = i.Amount, // Positive for income
                    Date = i.Date,
                    CategoryId = (Guid?)null,
                    Notes = (string?)null
                })
                .ToListAsync();

            // Combine and sort by date
            var allTransactions = expenses.Cast<object>().Concat(incomes.Cast<object>())
                .OrderByDescending(t => ((dynamic)t).Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var totalCount = expenses.Count + incomes.Count;

            return new
            {
                AccountId = account.AccountId,
                AccountName = account.Name,
                Transactions = allTransactions,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }
    }
}
