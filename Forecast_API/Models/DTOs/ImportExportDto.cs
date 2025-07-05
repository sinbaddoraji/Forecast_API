using System.ComponentModel.DataAnnotations;

namespace Forecast_API.Models.DTOs;

public class CsvImportDto
{
    [Required]
    public IFormFile File { get; set; } = null!;
    
    public bool SkipFirstRow { get; set; } = true;
    
    public string DateFormat { get; set; } = "yyyy-MM-dd";
    
    public CsvColumnMapping ColumnMapping { get; set; } = new();
}

public class CsvColumnMapping
{
    public int DateColumn { get; set; } = 0;
    public int DescriptionColumn { get; set; } = 1;
    public int AmountColumn { get; set; } = 2;
    public int CategoryColumn { get; set; } = 3;
    public int? AccountColumn { get; set; } = null;
    public int? NotesColumn { get; set; } = null;
}

public class ImportResultDto
{
    public int TotalRows { get; set; }
    public int SuccessfulImports { get; set; }
    public int FailedImports { get; set; }
    public IEnumerable<string> Errors { get; set; } = new List<string>();
}

public class ExportFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? AccountId { get; set; }
    public string ExportType { get; set; } = "transactions"; // transactions, budgets, categories, all
}

public class TransactionCsvRow
{
    public string Date { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class ReportGenerationDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Title { get; set; } = "Financial Report";
    public bool IncludeCharts { get; set; } = true;
    public bool IncludeBudgetAnalysis { get; set; } = true;
    public bool IncludeCategoryBreakdown { get; set; } = true;
    public bool IncludeNetWorthAnalysis { get; set; } = true;
}