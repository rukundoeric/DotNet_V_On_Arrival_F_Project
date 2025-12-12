using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Data;

public static class SuperAdminSeeder
{
    public static async Task SeedSuperAdminAsync(ApplicationDbContext context)
    {
        // Check if super admin already exists
        var superAdminEmail = "admin@visaonarrival.rw";
        var existingSuperAdmin = await context.Users
            .FirstOrDefaultAsync(u => u.Email == superAdminEmail);

        if (existingSuperAdmin != null)
        {
            // Super admin exists, ensure they have all permissions
            await EnsureAllPermissionsAsync(context, existingSuperAdmin.Id);
            return;
        }

        // Create super admin user
        var superAdmin = new User
        {
            FirstName = "Super",
            LastName = "Admin",
            Email = superAdminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"), // Change this password!
            EmployeeId = "SA001",
            Department = "Administration",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(superAdmin);
        await context.SaveChangesAsync();

        // Grant all permissions to super admin
        await EnsureAllPermissionsAsync(context, superAdmin.Id);

        Console.WriteLine($"✅ Super Admin created: {superAdminEmail} (ID: {superAdmin.Id})");
        Console.WriteLine($"⚠️  Default password: Admin@123 - CHANGE THIS IMMEDIATELY!");
    }

    private static async Task EnsureAllPermissionsAsync(ApplicationDbContext context, int userId)
    {
        // Get all permissions
        var allPermissions = await context.Permissions
            .Where(p => p.IsActive)
            .ToListAsync();

        // Get user's existing permissions
        var existingPermissionIds = await context.UserPermissions
            .Where(up => up.UserId == userId)
            .Select(up => up.PermissionId)
            .ToListAsync();

        // Find permissions that need to be granted
        var permissionsToGrant = allPermissions
            .Where(p => !existingPermissionIds.Contains(p.Id))
            .ToList();

        if (permissionsToGrant.Any())
        {
            var userPermissions = permissionsToGrant.Select(p => new UserPermission
            {
                UserId = userId,
                PermissionId = p.Id,
                GrantedAt = DateTime.UtcNow,
                GrantedByUserId = userId // Self-granted for super admin
            }).ToList();

            context.UserPermissions.AddRange(userPermissions);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Granted {permissionsToGrant.Count} permissions to Super Admin (User ID: {userId})");
        }
        else
        {
            Console.WriteLine($"✅ Super Admin (User ID: {userId}) already has all permissions");
        }
    }

    // Helper method to grant all permissions to any user (useful for promoting users to super admin)
    public static async Task GrantAllPermissionsAsync(ApplicationDbContext context, int userId, int grantedByUserId)
    {
        var user = await context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new ArgumentException($"User with ID {userId} not found");
        }

        // Get all permissions
        var allPermissions = await context.Permissions
            .Where(p => p.IsActive)
            .ToListAsync();

        // Get user's existing permissions
        var existingPermissionIds = await context.UserPermissions
            .Where(up => up.UserId == userId)
            .Select(up => up.PermissionId)
            .ToListAsync();

        // Grant missing permissions
        var permissionsToGrant = allPermissions
            .Where(p => !existingPermissionIds.Contains(p.Id))
            .ToList();

        if (permissionsToGrant.Any())
        {
            var userPermissions = permissionsToGrant.Select(p => new UserPermission
            {
                UserId = userId,
                PermissionId = p.Id,
                GrantedAt = DateTime.UtcNow,
                GrantedByUserId = grantedByUserId
            }).ToList();

            context.UserPermissions.AddRange(userPermissions);
            await context.SaveChangesAsync();
        }
    }
}
