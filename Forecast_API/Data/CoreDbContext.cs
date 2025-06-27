using Microsoft.EntityFrameworkCore;
using Forecast_API.Models;

namespace Forecast_API.Data;

public class CoreDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public CoreDbContext(DbContextOptions<CoreDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Space> Spaces { get; set; }
    public DbSet<SpaceMember> SpaceMembers { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Income> Incomes { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<SavingsGoal> SavingsGoals { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure enum to string conversion
        modelBuilder.Entity<Account>()
            .Property(e => e.Type)
            .HasConversion<string>();

        modelBuilder.Entity<SpaceMember>()
            .Property(e => e.Role)
            .HasConversion<string>();

        // Configure composite key for SpaceMember
        modelBuilder.Entity<SpaceMember>()
            .HasKey(sm => new { sm.UserId, sm.SpaceId });

        // Configure relationships
        modelBuilder.Entity<Space>()
            .HasOne(s => s.Owner)
            .WithMany(u => u.OwnedSpaces)
            .HasForeignKey(s => s.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SpaceMember>()
            .HasOne(sm => sm.User)
            .WithMany(u => u.SpaceMemberships)
            .HasForeignKey(sm => sm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SpaceMember>()
            .HasOne(sm => sm.Space)
            .WithMany(s => s.Members)
            .HasForeignKey(sm => sm.SpaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Account>()
            .HasOne(a => a.Space)
            .WithMany(s => s.Accounts)
            .HasForeignKey(a => a.SpaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Category>()
            .HasOne(c => c.Space)
            .WithMany(s => s.Categories)
            .HasForeignKey(c => c.SpaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Space)
            .WithMany(s => s.Expenses)
            .HasForeignKey(e => e.SpaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Account)
            .WithMany(a => a.Expenses)
            .HasForeignKey(e => e.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.AddedByUser)
            .WithMany(u => u.AddedExpenses)
            .HasForeignKey(e => e.AddedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Category)
            .WithMany(c => c.Expenses)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Income>()
            .HasOne(i => i.Space)
            .WithMany(s => s.Incomes)
            .HasForeignKey(i => i.SpaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Income>()
            .HasOne(i => i.Account)
            .WithMany(a => a.Incomes)
            .HasForeignKey(i => i.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Income>()
            .HasOne(i => i.AddedByUser)
            .WithMany(u => u.AddedIncomes)
            .HasForeignKey(i => i.AddedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Budget>()
            .HasOne(b => b.Space)
            .WithMany(s => s.Budgets)
            .HasForeignKey(b => b.SpaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Budget>()
            .HasOne(b => b.Category)
            .WithMany(c => c.Budgets)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SavingsGoal>()
            .HasOne(sg => sg.Space)
            .WithMany(s => s.SavingsGoals)
            .HasForeignKey(sg => sg.SpaceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure indexes for better query performance
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.AuthenticationProviderId)
            .IsUnique();

        modelBuilder.Entity<Expense>()
            .HasIndex(e => e.Date);

        modelBuilder.Entity<Income>()
            .HasIndex(i => i.Date);

        modelBuilder.Entity<Budget>()
            .HasIndex(b => new { b.SpaceId, b.StartDate, b.EndDate });

    }
}