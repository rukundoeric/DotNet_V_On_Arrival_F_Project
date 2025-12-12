using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Authorization;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.Services;

namespace VisaOnArrivalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPermissionService _permissionService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(
        ApplicationDbContext context,
        IPermissionService permissionService,
        ILogger<PermissionsController> logger)
    {
        _context = context;
        _permissionService = permissionService;
        _logger = logger;
    }

    // GET: api/Permissions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetPermissions()
    {
        try
        {
            var permissions = await _context.Permissions
                .Where(p => p.IsActive)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Category,
                    p.IsActive
                })
                .ToListAsync();

            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permissions");
            return StatusCode(500, "An error occurred while retrieving permissions");
        }
    }

    // GET: api/Permissions/user/5
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<string>>> GetUserPermissions(int userId)
    {
        try
        {
            var permissions = await _permissionService.GetUserPermissionsAsync(userId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permissions for user {UserId}", userId);
            return StatusCode(500, "An error occurred while retrieving user permissions");
        }
    }

    // POST: api/Permissions/grant
    [HttpPost("grant")]
    [RequirePermission("permissions.manage")]
    public async Task<IActionResult> GrantPermission([FromBody] GrantPermissionRequest request)
    {
        try
        {
            // Get the current user ID from header (in production, use JWT claims)
            var currentUserIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
            if (string.IsNullOrEmpty(currentUserIdHeader) || !int.TryParse(currentUserIdHeader, out var currentUserId))
            {
                return Unauthorized("User not authenticated");
            }

            await _permissionService.GrantPermissionAsync(
                request.UserId,
                request.PermissionName,
                currentUserId);

            _logger.LogInformation("Permission '{PermissionName}' granted to user {UserId} by user {GrantedBy}",
                request.PermissionName, request.UserId, currentUserId);

            return Ok(new { message = $"Permission '{request.PermissionName}' granted to user {request.UserId}" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request to grant permission");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error granting permission");
            return StatusCode(500, "An error occurred while granting permission");
        }
    }

    // POST: api/Permissions/revoke
    [HttpPost("revoke")]
    [RequirePermission("permissions.manage")]
    public async Task<IActionResult> RevokePermission([FromBody] RevokePermissionRequest request)
    {
        try
        {
            await _permissionService.RevokePermissionAsync(request.UserId, request.PermissionName);

            _logger.LogInformation("Permission '{PermissionName}' revoked from user {UserId}",
                request.PermissionName, request.UserId);

            return Ok(new { message = $"Permission '{request.PermissionName}' revoked from user {request.UserId}" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request to revoke permission");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking permission");
            return StatusCode(500, "An error occurred while revoking permission");
        }
    }
}

public record GrantPermissionRequest(int UserId, string PermissionName);
public record RevokePermissionRequest(int UserId, string PermissionName);
