using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using System.Text.Json;
using CsvHelper;
using CsvHelper.Configuration;
using Forecast_API.Data;
using Forecast_API.Models;
using Forecast_API.Models.DTOs;
using Forecast_API.Services;

namespace Forecast_API.Controllers;

[Authorize]
[ApiController]
[Route("api/spaces/{spaceId}/[controller]")]
public class ImportExportController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly IAuthorizationService _authorizationService;
    private readonly IUserService _userService;
    private readonly ILogger<ImportExportController> _logger;

    public ImportExportController(
        CoreDbContext context,
        IAuthorizationService authorizationService,
        IUserService userService,
        ILogger<ImportExportController> logger)
    {
        _context = context;
        _authorizationService = authorizationService;
        _userService = userService;
        _logger = logger;
    }

    private async Task<bool> IsUserMemberOfSpace(Guid spaceId)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(User, spaceId, "IsSpaceMember");
        return authorizationResult.Succeeded;
    }

    [HttpPost("import/csv")]
    public async Task<ActionResult<ImportResultDto>> ImportCsv(
        Guid spaceId,
        [FromForm] CsvImportDto importDto)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var user = await _userService.GetOrCreateUserAsync(User);
            var result = new ImportResultDto();
            var errors = new List<string>();

            // Read CSV content from uploaded file
            string csvContent;
            using (var streamReader = new StreamReader(importDto.File.OpenReadStream()))
            {
                csvContent = await streamReader.ReadToEndAsync();
            }

            var accounts = await _context.Accounts
                .Where(a => a.SpaceId == spaceId)
                .ToListAsync();

            var categories = await _context.Categories
                .Where(c => c.SpaceId == spaceId)
                .ToListAsync();

            var defaultAccount = accounts.FirstOrDefault();
            var defaultCategory = categories.FirstOrDefault();

            if (defaultAccount == null)
            {
                errors.Add("No accounts found in space. Please create at least one account before importing.");
                return BadRequest(new ImportResultDto { Errors = errors });
            }

            if (defaultCategory == null)
            {
                errors.Add("No categories found in space. Please create at least one category before importing.");
                return BadRequest(new ImportResultDto { Errors = errors });
            }

            // Use CsvHelper for robust CSV parsing
            using var reader = new StringReader(csvContent);
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = importDto.SkipFirstRow,
                MissingFieldFound = null
            };
            using var csv = new CsvReader(reader, config);
            
            var records = new List<string[]>();
            
            // Read all records as string arrays
            while (csv.Read())
            {
                var record = new string[csv.Parser.Count];
                for (int i = 0; i < csv.Parser.Count; i++)
                {
                    record[i] = csv.GetField(i) ?? "";
                }
                records.Add(record);
            }
            
            result.TotalRows = records.Count;
            
            foreach (var (columns, index) in records.Select((r, i) => (r, i)))
            {
                try
                {
                    if (columns.Length <= Math.Max(importDto.ColumnMapping.DateColumn, 
                        Math.Max(importDto.ColumnMapping.DescriptionColumn, importDto.ColumnMapping.AmountColumn)))
                    {
                        errors.Add($"Row {index + 1}: Insufficient columns");
                        result.FailedImports++;
                        continue;
                    }

                    var dateStr = columns[importDto.ColumnMapping.DateColumn];
                    var description = columns[importDto.ColumnMapping.DescriptionColumn];
                    var amountStr = columns[importDto.ColumnMapping.AmountColumn];

                    if (!DateTime.TryParseExact(dateStr, importDto.DateFormat, CultureInfo.InvariantCulture, 
                        DateTimeStyles.None, out var date))
                    {
                        errors.Add($"Row {index + 1}: Invalid date format '{dateStr}'");
                        result.FailedImports++;
                        continue;
                    }

                    if (!decimal.TryParse(amountStr, out var amount))
                    {
                        errors.Add($"Row {index + 1}: Invalid amount format '{amountStr}'");
                        result.FailedImports++;
                        continue;
                    }

                    amount = Math.Abs(amount);

                    var category = defaultCategory;
                    if (importDto.ColumnMapping.CategoryColumn < columns.Length)
                    {
                        var categoryName = columns[importDto.ColumnMapping.CategoryColumn].Trim('"');
                        var foundCategory = categories.FirstOrDefault(c => 
                            c.Name.Equals(categoryName, StringComparison.OrdinalIgnoreCase));
                        if (foundCategory != null)
                        {
                            category = foundCategory;
                        }
                    }

                    var account = defaultAccount;
                    if (importDto.ColumnMapping.AccountColumn.HasValue && 
                        importDto.ColumnMapping.AccountColumn.Value < columns.Length)
                    {
                        var accountName = columns[importDto.ColumnMapping.AccountColumn.Value].Trim('"');
                        var foundAccount = accounts.FirstOrDefault(a => 
                            a.Name.Equals(accountName, StringComparison.OrdinalIgnoreCase));
                        if (foundAccount != null)
                        {
                            account = foundAccount;
                        }
                    }

                    var notes = string.Empty;
                    if (importDto.ColumnMapping.NotesColumn.HasValue && 
                        importDto.ColumnMapping.NotesColumn.Value < columns.Length)
                    {
                        notes = columns[importDto.ColumnMapping.NotesColumn.Value].Trim('"');
                    }

                    var expense = new Expense
                    {
                        SpaceId = spaceId,
                        AccountId = account.AccountId,
                        Title = description,
                        Amount = amount,
                        Date = date,
                        AddedByUserId = user.UserId,
                        CategoryId = category.CategoryId,
                        Notes = notes
                    };

                    _context.Expenses.Add(expense);
                    
                    // Update account balance
                    account.CurrentBalance -= amount;
                    
                    result.SuccessfulImports++;
                }
                catch (Exception ex)
                {
                    errors.Add($"Row {index + 1}: {ex.Message}");
                    result.FailedImports++;
                }
            }

            await _context.SaveChangesAsync();

            result.Errors = errors;
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing CSV for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while importing the CSV file");
        }
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv(
        Guid spaceId,
        [FromQuery] ExportFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            var startDate = filter.StartDate ?? DateTime.Now.AddMonths(-12);
            var endDate = filter.EndDate ?? DateTime.Now;

            var expenses = await _context.Expenses
                .Where(e => e.SpaceId == spaceId && 
                           e.Date >= startDate && 
                           e.Date <= endDate &&
                           (!filter.CategoryId.HasValue || e.CategoryId == filter.CategoryId) &&
                           (!filter.AccountId.HasValue || e.AccountId == filter.AccountId))
                .Include(e => e.Category)
                .Include(e => e.Account)
                .Include(e => e.AddedByUser)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            var incomes = await _context.Incomes
                .Where(i => i.SpaceId == spaceId && 
                           i.Date >= startDate && 
                           i.Date <= endDate &&
                           (!filter.AccountId.HasValue || i.AccountId == filter.AccountId))
                .Include(i => i.Account)
                .Include(i => i.AddedByUser)
                .OrderByDescending(i => i.Date)
                .ToListAsync();

            // Use CsvHelper for robust CSV export
            using var writer = new StringWriter();
            using var csvWriter = new CsvWriter(writer, CultureInfo.InvariantCulture);
            
            // Write header
            csvWriter.WriteField("Date");
            csvWriter.WriteField("Type");
            csvWriter.WriteField("Description");
            csvWriter.WriteField("Amount");
            csvWriter.WriteField("Category");
            csvWriter.WriteField("Account");
            csvWriter.WriteField("Notes");
            csvWriter.WriteField("Added By");
            csvWriter.NextRecord();

            // Write expense records
            foreach (var expense in expenses)
            {
                csvWriter.WriteField(expense.Date.ToString("yyyy-MM-dd"));
                csvWriter.WriteField("Expense");
                csvWriter.WriteField(expense.Title);
                csvWriter.WriteField(expense.Amount);
                csvWriter.WriteField(expense.Category.Name);
                csvWriter.WriteField(expense.Account.Name);
                csvWriter.WriteField(expense.Notes ?? "");
                csvWriter.WriteField($"{expense.AddedByUser.FirstName} {expense.AddedByUser.LastName}");
                csvWriter.NextRecord();
            }

            // Write income records
            foreach (var income in incomes)
            {
                csvWriter.WriteField(income.Date.ToString("yyyy-MM-dd"));
                csvWriter.WriteField("Income");
                csvWriter.WriteField(income.Title);
                csvWriter.WriteField(income.Amount);
                csvWriter.WriteField("Income");
                csvWriter.WriteField(income.Account.Name);
                csvWriter.WriteField(income.Notes ?? "");
                csvWriter.WriteField($"{income.AddedByUser.FirstName} {income.AddedByUser.LastName}");
                csvWriter.NextRecord();
            }

            var bytes = Encoding.UTF8.GetBytes(writer.ToString());
            var fileName = $"transactions_{spaceId}_{DateTime.Now:yyyyMMdd}.csv";

            return File(bytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting CSV for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while exporting the CSV file");
        }
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel(
        Guid spaceId,
        [FromQuery] ExportFilterDto filter)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            // For now, return CSV format as Excel export would require additional packages
            // In a real implementation, you'd use libraries like EPPlus or ClosedXML
            return await ExportCsv(spaceId, filter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting Excel for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while exporting the Excel file");
        }
    }

    [HttpGet("export/pdf-report")]
    public async Task<IActionResult> ExportPdfReport(
        Guid spaceId,
        [FromQuery] ReportGenerationDto reportDto)
    {
        if (!await IsUserMemberOfSpace(spaceId))
            return Forbid();

        try
        {
            // For now, return a JSON report. In a real implementation, you'd use libraries like iTextSharp or PdfSharp
            var report = await GenerateFinancialReport(spaceId, reportDto);
            var json = JsonSerializer.Serialize(report, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });

            var bytes = Encoding.UTF8.GetBytes(json);
            var fileName = $"financial_report_{spaceId}_{DateTime.Now:yyyyMMdd}.json";

            return File(bytes, "application/json", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF report for space {SpaceId}", spaceId);
            return StatusCode(500, "An error occurred while generating the PDF report");
        }
    }

    private async Task<object> GenerateFinancialReport(Guid spaceId, ReportGenerationDto reportDto)
    {
        var expenses = await _context.Expenses
            .Where(e => e.SpaceId == spaceId && 
                       e.Date >= reportDto.StartDate && 
                       e.Date <= reportDto.EndDate)
            .Include(e => e.Category)
            .Include(e => e.Account)
            .ToListAsync();

        var incomes = await _context.Incomes
            .Where(i => i.SpaceId == spaceId && 
                       i.Date >= reportDto.StartDate && 
                       i.Date <= reportDto.EndDate)
            .Include(i => i.Account)
            .ToListAsync();

        var totalExpenses = expenses.Sum(e => e.Amount);
        var totalIncome = incomes.Sum(i => i.Amount);

        var categoryBreakdown = expenses
            .GroupBy(e => e.Category.Name)
            .Select(g => new
            {
                Category = g.Key,
                Amount = g.Sum(e => e.Amount),
                Percentage = totalExpenses > 0 ? (g.Sum(e => e.Amount) / totalExpenses) * 100 : 0
            })
            .OrderByDescending(cb => cb.Amount)
            .ToList();

        var monthlyTrends = expenses
            .GroupBy(e => new { e.Date.Year, e.Date.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Amount = g.Sum(e => e.Amount)
            })
            .OrderBy(mt => mt.Year)
            .ThenBy(mt => mt.Month)
            .ToList();

        return new
        {
            ReportTitle = reportDto.Title,
            GeneratedAt = DateTime.Now,
            Period = new
            {
                StartDate = reportDto.StartDate,
                EndDate = reportDto.EndDate
            },
            Summary = new
            {
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                NetIncome = totalIncome - totalExpenses,
                SavingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
            },
            CategoryBreakdown = categoryBreakdown,
            MonthlyTrends = monthlyTrends,
            TransactionCount = new
            {
                Expenses = expenses.Count,
                Incomes = incomes.Count
            }
        };
    }
}