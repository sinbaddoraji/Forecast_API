using System.ComponentModel.DataAnnotations;

namespace Forecast_API.Models.DTOs;

public class SpendingTrendDto
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
}

public class IncomeTrendDto
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
}

public class CashFlowDto
{
    public DateTime Date { get; set; }
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetFlow { get; set; }
}

public class CategoryBreakdownDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
}

public class MonthlySummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }
    public decimal SavingsRate { get; set; }
    public IEnumerable<CategoryBreakdownDto> TopCategories { get; set; } = new List<CategoryBreakdownDto>();
}

public class BudgetPerformanceDto
{
    public Guid BudgetId { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal BudgetAmount { get; set; }
    public decimal ActualSpent { get; set; }
    public decimal Remaining { get; set; }
    public decimal PercentageUsed { get; set; }
    public bool IsOverBudget { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class NetWorthDataPointDto
{
    public DateTime Date { get; set; }
    public decimal TotalAssets { get; set; }
    public decimal TotalLiabilities { get; set; }
    public decimal NetWorth { get; set; }
}

public class FinancialProjectionDto
{
    public DateTime Date { get; set; }
    public decimal ProjectedIncome { get; set; }
    public decimal ProjectedExpenses { get; set; }
    public decimal ProjectedSavings { get; set; }
    public decimal ProjectedNetWorth { get; set; }
}

public class AnalyticsFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Period { get; set; } = "monthly"; // monthly, weekly, daily
    public Guid? CategoryId { get; set; }
    public Guid? AccountId { get; set; }
}