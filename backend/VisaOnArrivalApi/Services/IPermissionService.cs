namespace VisaOnArrivalApi.Services;

public interface IPermissionService
{
    Task<bool> UserHasPermissionAsync(int userId, string permissionName);
    Task<List<string>> GetUserPermissionsAsync(int userId);
    Task GrantPermissionAsync(int userId, string permissionName, int grantedByUserId);
    Task RevokePermissionAsync(int userId, string permissionName);
}
