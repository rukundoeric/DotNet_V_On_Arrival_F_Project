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

    public UserRole Role { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public User? CreatedByUser { get; set; }
    public ICollection<User> CreatedUsers { get; set; } = new List<User>();
    public ICollection<ArrivalRecord> ApprovedRecords { get; set; } = new List<ArrivalRecord>();
    public ICollection<ArrivalRecord> ArrivalProcessedRecords { get; set; } = new List<ArrivalRecord>();
    public ICollection<ArrivalRecord> DepartureProcessedRecords { get; set; } = new List<ArrivalRecord>();
}
