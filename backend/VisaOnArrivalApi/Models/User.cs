using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? EmployeeId { get; set; }

    [MaxLength(100)]
    public string? Department { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    // Role is now used as a USER CATEGORY for dashboard routing, NOT for permission control
    // Permissions are managed through the UserPermissions table (PBAC)
    // Admin → Routes to Admin Dashboard
    // Officer → Routes to Officer Dashboard
    public UserRole Role { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public User? CreatedByUser { get; set; }
    public ICollection<User> CreatedUsers { get; set; } = new List<User>();
    public ICollection<ArrivalRecord> ApprovedRecords { get; set; } = new List<ArrivalRecord>();
    public ICollection<ArrivalRecord> ArrivalProcessedRecords { get; set; } = new List<ArrivalRecord>();
    public ICollection<ArrivalRecord> DepartureProcessedRecords { get; set; } = new List<ArrivalRecord>();
    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
    public ICollection<UserPermission> GrantedPermissions { get; set; } = new List<UserPermission>();
    public ICollection<UserApplication> UserApplications { get; set; } = new List<UserApplication>();

    // Many-to-many relationship with Permissions
    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
}
