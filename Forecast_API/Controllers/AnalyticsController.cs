using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Models;
using Forecast_API.Models.DTOs;
using Forecast_API.Services;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(
        CoreDbContext context,
        IAuthorizationService authorizationService,
        ILogger<AnalyticsController> logger)
    {
        _context = context;
        _authorizationService = authorizationService;
        _logger = logger;
    }

    private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
        return authorizationResult.Succeeded;
    }

    [HttpGet("spending-trends")]
    public async Task<ActionResult<IEnumerable<SpendingTrendDto>>> GetSpendingTrends(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-12);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var expenses = await _context.Expenses
                .Where(e => e.SpaceId == spaceId && e.Date >= startDate && e.Date <= endDate)
                .ToListAsync();

            var trends = expenses
                .GroupBy(e => GetPeriodKey(e.Date, filter.Period))
                .Select(g => new SpendingTrendDto
                {
                    Date = g.Key,
                    Amount = g.Sum(e => e.Amount)
                })
                .OrderBy(t => t.Date)
                .ToList();

            return Ok(trends);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving spending trends for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving spending trends");
        }
    }

    [HttpGet("income-trends")]
    public async Task<ActionResult<IEnumerable<IncomeTrendDto>>> GetIncomeTrends(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-12);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var incomes = await _context.Incomes
                .Where(i => i.SpaceId == spaceId && i.Date >= startDate && i.Date <= endDate)
                .ToListAsync();

            var trends = incomes
                .GroupBy(i => GetPeriodKey(i.Date, filter.Period))
                .Select(g => new IncomeTrendDto
                {
                    Date = g.Key,
                    Amount = g.Sum(i => i.Amount)
                })
                .OrderBy(t => t.Date)
                .ToList();

            return Ok(trends);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving income trends for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving income trends");
        }
    }

    [HttpGet("cash-flow")]
    public async Task<ActionResult<IEnumerable<CashFlowDto>>> GetCashFlow(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-12);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var expenses = await _context.Expenses
                .Where(e => e.SpaceId == spaceId && e.Date >= startDate && e.Date <= endDate)
                .ToListAsync();

            var incomes = await _context.Incomes
                .Where(i => i.SpaceId == spaceId && i.Date >= startDate && i.Date <= endDate)
                .ToListAsync();

            var expensesByPeriod = expenses
                .GroupBy(e => GetPeriodKey(e.Date, filter.Period))
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));

            var incomesByPeriod = incomes
                .GroupBy(i => GetPeriodKey(i.Date, filter.Period))
                .ToDictionary(g => g.Key, g => g.Sum(i => i.Amount));

            var allDates = expensesByPeriod.Keys.Union(incomesByPeriod.Keys).OrderBy(d => d);

            var cashFlow = allDates.Select(date => new CashFlowDto
            {
                Date = date,
                Income = incomesByPeriod.GetValueOrDefault(date, 0),
                Expenses = expensesByPeriod.GetValueOrDefault(date, 0),
                NetFlow = incomesByPeriod.GetValueOrDefault(date, 0) - expensesByPeriod.GetValueOrDefault(date, 0)
            }).ToList();

            return Ok(cashFlow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cash flow for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving cash flow");
        }
    }

    [HttpGet("category-breakdown")]
    public async Task<ActionResult<IEnumerable<CategoryBreakdownDto>>> GetCategoryBreakdown(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-1);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var categoryExpenses = await _context.Expenses
                .Where(e => e.SpaceId == spaceId && e.Date >= startDate && e.Date <= endDate)
                .Include(e => e.Category)
                .GroupBy(e => new { e.CategoryId, e.Category.Name, e.Category.Color })
                .Select(g => new
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    CategoryColor = g.Key.Color,
                    Amount = g.Sum(e => e.Amount)
                })
                .ToListAsync();

            var totalAmount = categoryExpenses.Sum(ce => ce.Amount);

            var breakdown = categoryExpenses.Select(ce => new CategoryBreakdownDto
            {
                CategoryId = ce.CategoryId,
                CategoryName = ce.CategoryName,
                CategoryColor = ce.CategoryColor ?? "#6B7280",
                Amount = ce.Amount,
                Percentage = totalAmount > 0 ? (ce.Amount / totalAmount) * 100 : 0
            }).OrderByDescending(cb => cb.Amount).ToList();

            return Ok(breakdown);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category breakdown for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving category breakdown");
        }
    }

    [HttpGet("monthly-summary")]
    public async Task<ActionResult<IEnumerable<MonthlySummaryDto>>> GetMonthlySummary(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-6);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var monthlyData = new List<MonthlySummaryDto>();

            var expenses = await _context.Expenses
                .Where(e => e.SpaceId == spaceId && e.Date >= startDate && e.Date <= endDate)
                .Include(e => e.Category)
                .ToListAsync();

            var incomes = await _context.Incomes
                .Where(i => i.SpaceId == spaceId && i.Date >= startDate && i.Date <= endDate)
                .ToListAsync();

            var groupedExpenses = expenses
                .GroupBy(e => new { e.Date.Year, e.Date.Month })
                .ToDictionary(g => g.Key, g => g.ToList());

            var groupedIncomes = incomes
                .GroupBy(i => new { i.Date.Year, i.Date.Month })
                .ToDictionary(g => g.Key, g => g.ToList());

            for (var date = new DateTime(startDate.Year, startDate.Month, 1, 0, 0, 0, DateTimeKind.Utc); 
                 date <= endDate; 
                 date = date.AddMonths(1))
            {
                var key = new { Year = date.Year, Month = date.Month };

                var monthlyExpenses = groupedExpenses.ContainsKey(key) ? groupedExpenses[key] : new List<Expense>();
                var monthlyIncomes = groupedIncomes.ContainsKey(key) ? groupedIncomes[key] : new List<Income>();
                var totalExpenses = monthlyExpenses.Sum(e => e.Amount);
                var totalIncome = monthlyIncomes.Sum(i => i.Amount);
                var netIncome = totalIncome - totalExpenses;

                var topCategories = monthlyExpenses
                    .GroupBy(e => new { e.CategoryId, e.Category.Name, e.Category.Color })
                    .Select(g => new CategoryBreakdownDto
                    {
                        CategoryId = g.Key.CategoryId,
                        CategoryName = g.Key.Name,
                        CategoryColor = g.Key.Color ?? "#6B7280",
                        Amount = g.Sum(e => e.Amount),
                        Percentage = totalExpenses > 0 ? (g.Sum(e => e.Amount) / totalExpenses) * 100 : 0
                    })
                    .OrderByDescending(cb => cb.Amount)
                    .Take(5)
                    .ToList();

                monthlyData.Add(new MonthlySummaryDto
                {
                    Year = date.Year,
                    Month = date.Month,
                    TotalIncome = totalIncome,
                    TotalExpenses = totalExpenses,
                    NetIncome = netIncome,
                    SavingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0,
                    TopCategories = topCategories
                });
            }

            return Ok(monthlyData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving monthly summary for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving monthly summary");
        }
    }

    [HttpGet("budget-performance")]
    public async Task<ActionResult<IEnumerable<BudgetPerformanceDto>>> GetBudgetPerformance(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var currentDate = DateTime.UtcNow;
            var startDate = filter.StartDate ?? new DateTime(currentDate.Year, currentDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = filter.EndDate ?? startDate.AddMonths(1).AddDays(-1);

            var budgets = await _context.Budgets
                .Where(b => b.SpaceId == spaceId && 
                           b.StartDate <= endDate && 
                           b.EndDate >= startDate)
                .Include(b => b.Category)
                .ToListAsync();

            var performance = new List<BudgetPerformanceDto>();

            foreach (var budget in budgets)
            {
                var actualSpent = await _context.Expenses
                    .Where(e => e.SpaceId == spaceId && 
                               e.CategoryId == budget.CategoryId &&
                               e.Date >= budget.StartDate && 
                               e.Date <= budget.EndDate)
                    .SumAsync(e => e.Amount);

                var remaining = budget.Amount - actualSpent;
                var percentageUsed = budget.Amount > 0 ? (actualSpent / budget.Amount) * 100 : 0;

                performance.Add(new BudgetPerformanceDto
                {
                    BudgetId = budget.BudgetId,
                    CategoryId = budget.CategoryId,
                    CategoryName = budget.Category.Name,
                    BudgetAmount = budget.Amount,
                    ActualSpent = actualSpent,
                    Remaining = remaining,
                    PercentageUsed = percentageUsed,
                    IsOverBudget = actualSpent > budget.Amount,
                    StartDate = budget.StartDate,
                    EndDate = budget.EndDate
                });
            }

            return Ok(performance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budget performance for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving budget performance");
        }
    }

    [HttpGet("net-worth")]
    public async Task<ActionResult<IEnumerable<NetWorthDataPointDto>>> GetNetWorth(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var startDate = filter.StartDate ?? DateTime.UtcNow.AddMonths(-12);
            var endDate = filter.EndDate ?? DateTime.UtcNow;

            var netWorthData = new List<NetWorthDataPointDto>();

            for (var date = startDate; date <= endDate; date = date.AddMonths(1))
            {
                var accounts = await _context.Accounts
                    .Where(a => a.SpaceId == spaceId)
                    .ToListAsync();

                var totalAssets = accounts.Sum(a => a.CurrentBalance);
                var totalLiabilities = 0m; // For now, assuming no liability accounts

                netWorthData.Add(new NetWorthDataPointDto
                {
                    Date = date,
                    TotalAssets = totalAssets,
                    TotalLiabilities = totalLiabilities,
                    NetWorth = totalAssets - totalLiabilities
                });
            }

            return Ok(netWorthData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving net worth for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving net worth");
        }
    }

    [HttpGet("projections")]
    public async Task<ActionResult<IEnumerable<FinancialProjectionDto>>> GetProjections(
        Guid spaceId,
        [FromQuery] AnalyticsFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var historicalMonths = 3;
            var projectionMonths = 6;
            var startDate = DateTime.UtcNow.AddMonths(-historicalMonths);
            var endDate = DateTime.UtcNow;

            // Calculate historical averages
            var historicalExpenses = await _context.Expenses
                .Where(e => e.SpaceId == spaceId && e.Date >= startDate && e.Date <= endDate)
                .ToListAsync();

            var historicalIncomes = await _context.Incomes
                .Where(i => i.SpaceId == spaceId && i.Date >= startDate && i.Date <= endDate)
                .ToListAsync();

            var avgMonthlyExpenses = historicalExpenses.Any() ? 
                historicalExpenses.Sum(e => e.Amount) / historicalMonths : 0;
            var avgMonthlyIncome = historicalIncomes.Any() ? 
                historicalIncomes.Sum(i => i.Amount) / historicalMonths : 0;

            var currentNetWorth = await _context.Accounts
                .Where(a => a.SpaceId == spaceId)
                .SumAsync(a => a.CurrentBalance);

            var projections = new List<FinancialProjectionDto>();

            for (int i = 1; i <= projectionMonths; i++)
            {
                var projectionDate = DateTime.UtcNow.AddMonths(i);
                var projectedSavings = avgMonthlyIncome - avgMonthlyExpenses;
                var projectedNetWorth = currentNetWorth + (projectedSavings * i);

                projections.Add(new FinancialProjectionDto
                {
                    Date = projectionDate,
                    ProjectedIncome = avgMonthlyIncome,
                    ProjectedExpenses = avgMonthlyExpenses,
                    ProjectedSavings = projectedSavings,
                    ProjectedNetWorth = projectedNetWorth
                });
            }

            return Ok(projections);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving projections for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while retrieving projections");
        }
    }

    private static DateTime GetPeriodKey(DateTime date, string period)
    {
        return period.ToLower() switch
        {
            "daily" => date.Date,
            "weekly" => date.Date.AddDays(-(int)date.DayOfWeek),
            "monthly" => new DateTime(date.Year, date.Month, 1, 0, 0, 0, DateTimeKind.Utc),
            _ => new DateTime(date.Year, date.Month, 1, 0, 0, 0, DateTimeKind.Utc)
        };
    }
}