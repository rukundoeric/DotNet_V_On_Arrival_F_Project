using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Services;

public class PermissionService : IPermissionService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PermissionService> _logger;

    public PermissionService(ApplicationDbContext context, ILogger<PermissionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> UserHasPermissionAsync(int userId, string permissionName)
    {
        try
        {
            var hasPermission = await _context.UserPermissions
                .AnyAsync(up => up.UserId == userId
                    && up.Permission.Name == permissionName
                    && up.Permission.IsActive);

            _logger.LogDebug("User {UserId} permission check for '{PermissionName}': {HasPermission}",
                userId, permissionName, hasPermission);

            return hasPermission;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking permission {PermissionName} for user {UserId}",
                permissionName, userId);
            return false;
        }
    }

    public async Task<List<string>> GetUserPermissionsAsync(int userId)
    {
        try
        {
            var permissions = await _context.UserPermissions
                .Where(up => up.UserId == userId && up.Permission.IsActive)
                .Select(up => up.Permission.Name)
                .ToListAsync();

            _logger.LogDebug("Retrieved {Count} permissions for user {UserId}", permissions.Count, userId);
            return permissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permissions for user {UserId}", userId);
            return new List<string>();
        }
    }

    public async Task GrantPermissionAsync(int userId, string permissionName, int grantedByUserId)
    {
        try
        {
            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                throw new ArgumentException($"User with ID {userId} not found");
            }

            // Get permission
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Name == permissionName && p.IsActive);

            if (permission == null)
            {
                throw new ArgumentException($"Permission '{permissionName}' not found or inactive");
            }

            // Check if permission already granted
            var existingPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permission.Id);

            if (existingPermission != null)
            {
                _logger.LogWarning("Permission '{PermissionName}' already granted to user {UserId}",
                    permissionName, userId);
                return;
            }

            // Grant permission
            var userPermission = new UserPermission
            {
                UserId = userId,
                PermissionId = permission.Id,
                GrantedByUserId = grantedByUserId,
                GrantedAt = DateTime.UtcNow
            };

            _context.UserPermissions.Add(userPermission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Permission '{PermissionName}' granted to user {UserId} by user {GrantedByUserId}",
                permissionName, userId, grantedByUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error granting permission '{PermissionName}' to user {UserId}",
                permissionName, userId);
            throw;
        }
    }

    public async Task RevokePermissionAsync(int userId, string permissionName)
    {
        try
        {
            // Get permission
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Name == permissionName);

            if (permission == null)
            {
                throw new ArgumentException($"Permission '{permissionName}' not found");
            }

            // Find and remove user permission
            var userPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permission.Id);

            if (userPermission == null)
            {
                _logger.LogWarning("Permission '{PermissionName}' not found for user {UserId}",
                    permissionName, userId);
                return;
            }

            _context.UserPermissions.Remove(userPermission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Permission '{PermissionName}' revoked from user {UserId}",
                permissionName, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking permission '{PermissionName}' from user {UserId}",
                permissionName, userId);
            throw;
        }
    }
}
