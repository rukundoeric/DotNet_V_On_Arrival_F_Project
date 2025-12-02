using Microsoft.EntityFrameworkCore;
using DotNet_V_On_Arrival_F_Projectcation2.Models;

namespace DotNet_V_On_Arrival_F_Projectcation2.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<VisaApplication> VisaApplications { get; set; }
    public DbSet<ArrivalRecord> ArrivalRecords { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // VisaApplication configuration
        modelBuilder.Entity<VisaApplication>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReferenceNumber).IsUnique();
            entity.HasIndex(e => e.PassportNumber);
            entity.HasIndex(e => e.Email);

            entity.Property(e => e.ApplicationStatus)
                .HasConversion<string>();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        });

        // ArrivalRecord configuration
        modelBuilder.Entity<ArrivalRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.VisaApplicationId).IsUnique();

            entity.Property(e => e.EntryStatus)
                .HasConversion<string>();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Relationships
            entity.HasOne(e => e.VisaApplication)
                .WithOne(v => v.ArrivalRecord)
                .HasForeignKey<ArrivalRecord>(e => e.VisaApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ApprovedByUser)
                .WithMany(u => u.ApprovedRecords)
                .HasForeignKey(e => e.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ArrivalProcessedByUser)
                .WithMany(u => u.ArrivalProcessedRecords)
                .HasForeignKey(e => e.ArrivalProcessedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DepartureProcessedByUser)
                .WithMany(u => u.DepartureProcessedRecords)
                .HasForeignKey(e => e.DepartureProcessedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.EmployeeId);

            entity.Property(e => e.Role)
                .HasConversion<string>();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Self-referencing relationship
            entity.HasOne(e => e.CreatedByUser)
                .WithMany(u => u.CreatedUsers)
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
