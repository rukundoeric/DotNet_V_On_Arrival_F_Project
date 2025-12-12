using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using VisaOnArrivalApi.Services;

namespace VisaOnArrivalApi.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _permissionName;

    public RequirePermissionAttribute(string permissionName)
    {
        _permissionName = permissionName;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // Check if user is authenticated
        if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                error = "User not authenticated."
            });
            return;
        }

        // Get user ID from JWT claims
        var userIdClaim = context.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                error = "Invalid user claims."
            });
            return;
        }

        var permissionService = context.HttpContext.RequestServices
            .GetRequiredService<IPermissionService>();

        var hasPermission = await permissionService.UserHasPermissionAsync(userId, _permissionName);

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
            context.HttpContext.Response.StatusCode = 403;
            context.Result = new JsonResult(new
            {
                error = $"Access denied. Required permission: {_permissionName}"
            })
            {
                StatusCode = 403
            };
        }
    }
}
