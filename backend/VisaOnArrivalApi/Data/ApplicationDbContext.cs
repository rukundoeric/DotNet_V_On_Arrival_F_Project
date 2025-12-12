using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<VisaApplication> VisaApplications { get; set; }
    public DbSet<ArrivalRecord> ArrivalRecords { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<UserPermission> UserPermissions { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<UserApplication> UserApplications { get; set; }

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

        // Permission configuration
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Category);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        });

        // UserPermission configuration
        modelBuilder.Entity<UserPermission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.PermissionId }).IsUnique();

            entity.Property(e => e.GrantedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserPermissions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Permission)
                .WithMany(p => p.UserPermissions)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.GrantedByUser)
                .WithMany(u => u.GrantedPermissions)
                .HasForeignKey(e => e.GrantedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure many-to-many relationship between User and Permission
        modelBuilder.Entity<User>()
            .HasMany(u => u.Permissions)
            .WithMany(p => p.Users)
            .UsingEntity<UserPermission>(
                j => j.HasOne(up => up.Permission)
                    .WithMany(p => p.UserPermissions)
                    .HasForeignKey(up => up.PermissionId),
                j => j.HasOne(up => up.User)
                    .WithMany(u => u.UserPermissions)
                    .HasForeignKey(up => up.UserId)
            );

        // Country configuration
        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.Code2);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        });

        // UserApplication configuration
        modelBuilder.Entity<UserApplication>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.VisaApplicationId }).IsUnique();

            entity.Property(e => e.LinkedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserApplications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.VisaApplication)
                .WithMany(v => v.UserApplications)
                .HasForeignKey(e => e.VisaApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
