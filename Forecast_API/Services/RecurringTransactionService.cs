using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Models;

namespace Forecast_API.Services;

public class RecurringTransactionService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RecurringTransactionService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(6); // Check every 6 hours

    public RecurringTransactionService(IServiceProvider serviceProvider, ILogger<RecurringTransactionService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDueRecurringTransactions();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recurring transactions");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task ProcessDueRecurringTransactions()
    {
        using var scope = _serviceProvider.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<CoreDbContext>();

        var now = DateTime.UtcNow;

        // Process due recurring expenses
        await ProcessDueRecurringExpenses(context, now);

        // Process due recurring incomes
        await ProcessDueRecurringIncomes(context, now);
    }

    private async Task ProcessDueRecurringExpenses(CoreDbContext context, DateTime now)
    {
        var dueExpenses = await context.RecurringExpenses
            .Where(re => re.IsActive && re.NextDueDate <= now)
            .Include(re => re.Account)
            .ToListAsync();

        foreach (var recurringExpense in dueExpenses)
        {
            try
            {
                // Only generate if category is set
                if (recurringExpense.CategoryId == null)
                {
                    _logger.LogWarning("Skipping recurring expense {Id} - no category set", recurringExpense.RecurringExpenseId);
                    continue;
                }

                // Check if we should stop generating (end date reached)
                if (recurringExpense.EndDate.HasValue && now > recurringExpense.EndDate.Value)
                {
                    recurringExpense.IsActive = false;
                    _logger.LogInformation("Deactivating expired recurring expense {Id}", recurringExpense.RecurringExpenseId);
                    continue;
                }

                // Create the expense
                var expense = new Expense
                {
                    ExpenseId = Guid.NewGuid(),
                    SpaceId = recurringExpense.SpaceId,
                    AccountId = recurringExpense.AccountId,
                    Title = recurringExpense.Title,
                    Amount = recurringExpense.Amount,
                    Date = now,
                    CategoryId = recurringExpense.CategoryId.Value,
                    Notes = $"Auto-generated from recurring expense: {recurringExpense.Notes}",
                    AddedByUserId = recurringExpense.CreatedByUserId
                };

                context.Expenses.Add(expense);

                // Update account balance
                if (recurringExpense.Account != null)
                {
                    recurringExpense.Account.CurrentBalance -= recurringExpense.Amount;
                    recurringExpense.Account.UpdatedAt = now;
                }

                // Update recurring expense
                recurringExpense.LastGeneratedDate = now;
                recurringExpense.NextDueDate = CalculateNextDueDate(recurringExpense.NextDueDate, recurringExpense.Frequency);
                recurringExpense.UpdatedAt = now;

                _logger.LogInformation("Generated expense {ExpenseId} from recurring expense {RecurringId}", 
                    expense.ExpenseId, recurringExpense.RecurringExpenseId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate expense from recurring expense {Id}", recurringExpense.RecurringExpenseId);
            }
        }

        if (dueExpenses.Any())
        {
            await context.SaveChangesAsync();
            _logger.LogInformation("Processed {Count} due recurring expenses", dueExpenses.Count);
        }
    }

    private async Task ProcessDueRecurringIncomes(CoreDbContext context, DateTime now)
    {
        var dueIncomes = await context.RecurringIncomes
            .Where(ri => ri.IsActive && ri.NextDueDate <= now)
            .Include(ri => ri.Account)
            .ToListAsync();

        foreach (var recurringIncome in dueIncomes)
        {
            try
            {
                // Check if we should stop generating (end date reached)
                if (recurringIncome.EndDate.HasValue && now > recurringIncome.EndDate.Value)
                {
                    recurringIncome.IsActive = false;
                    _logger.LogInformation("Deactivating expired recurring income {Id}", recurringIncome.RecurringIncomeId);
                    continue;
                }

                // Create the income
                var income = new Income
                {
                    IncomeId = Guid.NewGuid(),
                    SpaceId = recurringIncome.SpaceId,
                    AccountId = recurringIncome.AccountId,
                    Title = recurringIncome.Title,
                    Amount = recurringIncome.Amount,
                    Date = now,
                    Notes = $"Auto-generated from recurring income: {recurringIncome.Notes}",
                    AddedByUserId = recurringIncome.CreatedByUserId
                };

                context.Incomes.Add(income);

                // Update account balance
                if (recurringIncome.Account != null)
                {
                    recurringIncome.Account.CurrentBalance += recurringIncome.Amount;
                    recurringIncome.Account.UpdatedAt = now;
                }

                // Update recurring income
                recurringIncome.LastGeneratedDate = now;
                recurringIncome.NextDueDate = CalculateNextDueDate(recurringIncome.NextDueDate, recurringIncome.Frequency);
                recurringIncome.UpdatedAt = now;

                _logger.LogInformation("Generated income {IncomeId} from recurring income {RecurringId}", 
                    income.IncomeId, recurringIncome.RecurringIncomeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate income from recurring income {Id}", recurringIncome.RecurringIncomeId);
            }
        }

        if (dueIncomes.Any())
        {
            await context.SaveChangesAsync();
            _logger.LogInformation("Processed {Count} due recurring incomes", dueIncomes.Count);
        }
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