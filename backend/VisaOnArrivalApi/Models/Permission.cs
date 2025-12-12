using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.Models;

public class Permission
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty; // e.g., "visa_applications.view"

    [MaxLength(255)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty; // e.g., "visa_applications", "users", "arrival_records"

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();

    // Many-to-many relationship with Users
    public ICollection<User> Users { get; set; } = new List<User>();
}
