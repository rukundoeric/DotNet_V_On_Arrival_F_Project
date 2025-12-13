using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Data;

public static class PermissionSeeder
{
    public static async Task SeedPermissionsAsync(ApplicationDbContext context)
    {
        // Check if permissions already exist
        if (await context.Permissions.AnyAsync())
        {
            return; // Permissions already seeded
        }

        var permissions = new List<Permission>
        {
            // Visa Application Permissions
            new Permission
            {
                Name = "visa_applications.view",
                Description = "View visa applications",
                Category = "visa_applications",
                IsActive = true
            },
            new Permission
            {
                Name = "visa_applications.create",
                Description = "Create visa applications",
                Category = "visa_applications",
                IsActive = true
            },
            new Permission
            {
                Name = "visa_applications.update",
                Description = "Update visa applications",
                Category = "visa_applications",
                IsActive = true
            },
            new Permission
            {
                Name = "visa_applications.delete",
                Description = "Delete visa applications",
                Category = "visa_applications",
                IsActive = true
            },
            new Permission
            {
                Name = "visa_applications.approve",
                Description = "Approve visa applications",
                Category = "visa_applications",
                IsActive = true
            },
            new Permission
            {
                Name = "visa_applications.reject",
                Description = "Reject visa applications",
                Category = "visa_applications",
                IsActive = true
            },

            // Arrival Records Permissions
            new Permission
            {
                Name = "arrival_records.view",
                Description = "View arrival records",
                Category = "arrival_records",
                IsActive = true
            },
            new Permission
            {
                Name = "arrival_records.create",
                Description = "Create arrival records",
                Category = "arrival_records",
                IsActive = true
            },
            new Permission
            {
                Name = "arrival_records.update",
                Description = "Update arrival records",
                Category = "arrival_records",
                IsActive = true
            },
            new Permission
            {
                Name = "arrival_records.delete",
                Description = "Delete arrival records",
                Category = "arrival_records",
                IsActive = true
            },

            // User Permissions
            new Permission
            {
                Name = "users.view",
                Description = "View users",
                Category = "users",
                IsActive = true
            },
            new Permission
            {
                Name = "users.create",
                Description = "Create users",
                Category = "users",
                IsActive = true
            },
            new Permission
            {
                Name = "users.update",
                Description = "Update users",
                Category = "users",
                IsActive = true
            },
            new Permission
            {
                Name = "users.delete",
                Description = "Delete users",
                Category = "users",
                IsActive = true
            },

            // Permission Management
            new Permission
            {
                Name = "permissions.manage",
                Description = "Manage user permissions (grant/revoke)",
                Category = "permissions",
                IsActive = true
            },

            // Country Permissions
            new Permission
            {
                Name = "countries.view",
                Description = "View countries",
                Category = "countries",
                IsActive = true
            },
            new Permission
            {
                Name = "countries.create",
                Description = "Create countries",
                Category = "countries",
                IsActive = true
            },
            new Permission
            {
                Name = "countries.update",
                Description = "Update countries",
                Category = "countries",
                IsActive = true
            },
            new Permission
            {
                Name = "countries.delete",
                Description = "Delete countries",
                Category = "countries",
                IsActive = true
            },

            // Reports Permissions
            new Permission
            {
                Name = "reports.view",
                Description = "View reports and analytics",
                Category = "reports",
                IsActive = true
            },
            new Permission
            {
                Name = "reports.export",
                Description = "Export reports data",
                Category = "reports",
                IsActive = true
            }
        };

        await context.Permissions.AddRangeAsync(permissions);
        await context.SaveChangesAsync();
    }
}
