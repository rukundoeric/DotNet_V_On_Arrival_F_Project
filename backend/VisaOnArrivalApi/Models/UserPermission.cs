using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.Models;

public class UserPermission
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int PermissionId { get; set; }

    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    public int? GrantedByUserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
    public User? GrantedByUser { get; set; }
}
